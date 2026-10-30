/**
 * source/js/site-action-api.js
 * 语义化操作注册与调用接口
 *
 * 设计目标：
 * - 不暴露 DOM 选择器
 * - 所有操作都有明确 action id
 * - 写操作带权限和确认边界
 */
(function (global) {
    'use strict';

    var actions = Object.create(null);

    function register(id, handler, meta) {
        if (!id || typeof handler !== 'function') throw new Error('SiteActionAPI.register 需要 id 与 handler');
        meta = meta || {};
        actions[id] = {
            id: id,
            handler: handler,
            label: meta.label || id,
            scope: meta.scope || 'read',
            description: meta.description || '',
            requiresConfirmation: meta.requiresConfirmation === true,
            confirmText: meta.confirmText || '确定执行该操作吗？'
        };
        return actions[id];
    }

    function get(id) {
        return actions[id] || null;
    }

    function list() {
        return Object.keys(actions).map(function (id) {
            var a = actions[id];
            return {
                id: a.id,
                label: a.label,
                scope: a.scope,
                description: a.description,
                requiresConfirmation: a.requiresConfirmation
            };
        });
    }

    function makeError(code, message) {
        var err = new Error(message);
        err.code = code;
        return err;
    }

    function invoke(id, payload, options) {
        options = options || {};
        var action = actions[id];
        if (!action) return Promise.reject(makeError('E_UNKNOWN_ACTION', '未知操作：' + id));
        if (action.scope === 'write-local' && action.requiresConfirmation && options.confirmed !== true) {
            if (typeof window.confirm === 'function' && window.confirm(action.confirmText)) {
                options.confirmed = true;
            } else {
                return Promise.reject(makeError('E_CONFIRM', '操作需要用户确认：' + id));
            }
        }
        return Promise.resolve().then(function () {
            return action.handler(payload || {}, {
                id: action.id,
                scope: action.scope,
                confirmed: options.confirmed === true
            });
        }).then(function (result) {
            try { SiteEvents.emit('action:done', { id: id, payload: payload, result: result }); } catch (e) { /* ignore */ }
            return result;
        }).catch(function (err) {
            try { SiteEvents.emit('action:error', { id: id, payload: payload, error: String(err && err.message || err) }); } catch (e) { /* ignore */ }
            throw err;
        });
    }

    global.SiteActionAPI = {
        register: register,
        get: get,
        list: list,
        invoke: invoke
    };
})(window);
