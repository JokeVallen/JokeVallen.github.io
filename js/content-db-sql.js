/**
 * source/js/content-db-sql.js
 * ContentDB 的可选 SQLite 查询层（按需懒加载）
 *
 * 默认优先加载本地:
 *   /js/vendor/sql-wasm.js
 *   /js/vendor/sql-wasm.wasm
 * 本地不存在时回退到 jsDelivr CDN。
 *
 * 对外接口：
 *   ContentDB.sql(sql, params, options)
 *   PetContentAPI.sql(sql, params, options)
 */
(function (global) {
    'use strict';

    var SQLITE_URL = '/content-db.sqlite';
    var LOCAL_BASE = '/js/vendor/';
    var CDN_BASE = 'https://cdn.jsdelivr.net/npm/sql.js@1.13.0/dist/';
    var state = {
        sql: null,
        db: null,
        promise: null,
        base: null
    };

    var FORBIDDEN = /\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|REPLACE|ATTACH|DETACH|PRAGMA|VACUUM|REINDEX|TRIGGER)\b/i;

    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            var s = document.createElement('script');
            s.src = src;
            s.async = true;
            s.onload = function () { resolve(src); };
            s.onerror = function () { reject(new Error('无法加载 ' + src)); };
            document.head.appendChild(s);
        });
    }

    function ensureSqlJs() {
        if (global.initSqlJs) return Promise.resolve(global.initSqlJs);
        if (state.promise) return state.promise;
        state.promise = loadScript(LOCAL_BASE + 'sql-wasm.js')
            .then(function () { state.base = LOCAL_BASE; return global.initSqlJs; })
            .catch(function () {
                return loadScript(CDN_BASE + 'sql-wasm.js').then(function () {
                    state.base = CDN_BASE;
                    return global.initSqlJs;
                });
            })
            .then(function (init) {
                if (!init) throw new Error('sql.js 初始化函数不存在');
                return init({ locateFile: function (file) { return state.base + file; } });
            })
            .then(function (SQL) {
                state.sql = SQL;
                return SQL;
            })
            .catch(function (err) {
                state.promise = null;
                throw err;
            });
        return state.promise;
    }

    function ensureDb() {
        if (state.db) return Promise.resolve(state.db);
        return ensureSqlJs().then(function (SQL) {
            return fetch(SQLITE_URL, { cache: 'no-cache' }).then(function (res) {
                if (!res.ok) throw new Error('content-db.sqlite: HTTP ' + res.status);
                return res.arrayBuffer();
            }).then(function (buffer) {
                state.db = new SQL.Database(new Uint8Array(buffer));
                return state.db;
            });
        });
    }

    function normalizeSql(sql, options) {
        var text = String(sql || '').trim();
        if (!text) throw new Error('SQL 不能为空');
        if (!/^(SELECT|WITH)\b/i.test(text)) throw new Error('只允许 SELECT / WITH 只读查询');
        if (FORBIDDEN.test(text)) throw new Error('SQL 包含禁止的写操作关键字');
        if (text.indexOf(';') !== -1 && !/;\s*$/.test(text)) {
            throw new Error('只允许执行单条 SQL');
        }
        text = text.replace(/;\s*$/, '');
        if (options && options.forceLimit !== false && !/\bLIMIT\s+\d+/i.test(text)) {
            text += ' LIMIT ' + Math.max(1, Math.min(500, Number(options.maxRows) || 100));
        }
        return text;
    }

    function query(sql, params, options) {
        options = options || {};
        var text;
        try {
            text = normalizeSql(sql, options);
        } catch (err) {
            return Promise.reject(err);
        }
        return ensureDb().then(function (db) {
            var started = Date.now();
            var stmt = db.prepare(text);
            var rows = [];
            try {
                if (params) stmt.bind(params);
                while (stmt.step()) {
                    rows.push(stmt.getAsObject());
                }
            } finally {
                stmt.free();
            }
            return {
                sql: text,
                rows: rows,
                rowCount: rows.length,
                elapsedMs: Date.now() - started,
                truncated: !!(options.maxRows && rows.length >= options.maxRows)
            };
        });
    }

    function execReadOnly(sql, params, options) {
        return query(sql, params, options);
    }

    function listTables() {
        return query("SELECT name, type FROM sqlite_master WHERE type IN ('table','view') AND name NOT LIKE 'sqlite_%' ORDER BY name", null, { forceLimit: false });
    }

    function schema(table) {
        var safe = String(table || '').replace(/[^A-Za-z0-9_]/g, '');
        if (!safe) return Promise.reject(new Error('表名不合法'));
        return ensureDb().then(function (db) {
            var stmt = db.prepare('PRAGMA table_info(' + safe + ')');
            var rows = [];
            try {
                while (stmt.step()) rows.push(stmt.getAsObject());
            } finally {
                stmt.free();
            }
            return { rows: rows, rowCount: rows.length };
        });
    }

    function close() {
        if (state.db) {
            state.db.close();
            state.db = null;
        }
    }

    var api = {
        url: SQLITE_URL,
        ensure: ensureDb,
        query: query,
        sql: execReadOnly,
        listTables: listTables,
        schema: schema,
        close: close,
        get ready() { return !!state.db; }
    };

    global.ContentDBSQL = api;
    if (global.ContentDB) {
        global.ContentDB.sql = execReadOnly;
        global.ContentDB.sqlite = api;
    }
    if (global.PetContentAPI) {
        global.PetContentAPI.sql = execReadOnly;
        global.PetContentAPI.sqlite = api;
    }
})(window);
