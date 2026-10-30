/**
 * source/js/site-quiz-api.js
 * 笔试卷语义操作封装
 */
(function (global) {
    'use strict';

    function call(id, payload, options) {
        if (!global.SiteActionAPI) return Promise.reject(new Error('SiteActionAPI 未加载'));
        return global.SiteActionAPI.invoke(id, payload || {}, options || {});
    }

    function current() {
        var ctx = global.SiteContext ? global.SiteContext.get() : null;
        if (!ctx || ctx.type !== 'paper') return Promise.resolve(null);
        return call('quiz.status').then(function (rows) {
            return {
                paperId: ctx.id,
                title: ctx.title,
                path: ctx.path,
                answers: rows || []
            };
        });
    }

    function start(paperId, questionId) {
        if (!global.SiteNavigationAPI) return Promise.resolve(false);
        return global.SiteNavigationAPI.openQuestion(paperId, questionId);
    }

    function answer(qIndex, answers) {
        return call('quiz.answer', { qIndex: qIndex, answers: answers });
    }

    function status() { return call('quiz.status'); }
    function skip(qIndex) { return call('quiz.skip', { qIndex: qIndex }); }
    function grade(options) { return call('quiz.grade', {}, options || {}); }
    function reset(options) { return call('quiz.reset', {}, options || {}); }
    function openAnswerSheet() { return call('quiz.openAnswerSheet'); }
    function startTimer() { return call('quiz.startTimer'); }

    global.SiteQuiz = {
        current: current,
        start: start,
        answer: answer,
        status: status,
        skip: skip,
        grade: grade,
        reset: reset,
        openAnswerSheet: openAnswerSheet,
        startTimer: startTimer
    };
})(window);
