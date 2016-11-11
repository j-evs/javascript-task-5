'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
getEmitter.isStar = true;
module.exports = getEmitter;

/**
 * Возвращает новый emitter
 * @returns {Object}
 */
function getEmitter() {
    return {
        subscribers: [],

        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         */
        on: function (event, context, handler) {
            if (!this.subscribers.includes(context)) {
                context.events = {};
                this.subscribers.push(context);
            }
            context.events[event] = handler;

            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         */
        off: function (event, context) {
            delete context.events[event];

            return this;
        },

        /**
         * Уведомить о событии
         * @param {String} event
         */
        emit: function (event) {
            let totalEvents = event.includes('.')
                ? [event, event.split('.')[0]]
                : [event];

            this.subscribers.forEach(student => {
                totalEvents.forEach(studentEvent => {
                    if (student.events[studentEvent] &&
                        handleExcecutionLimits.call(this, student, studentEvent)) {
                        student.events[studentEvent].call(student);
                    }
                });
            });

            return this;

            function handleExcecutionLimits(student, executingEventName) {

                let executingEvent = student.events[executingEventName];
                let executingEventType;

                if (executingEvent.handlerExecutionsLeft !== undefined) {
                    executingEventType = 'limited';
                } else if (executingEvent.frequency !== undefined) {
                    executingEventType = 'frequent';
                } else {
                    executingEventType = 'standard';
                }

                switch (executingEventType) {
                    case 'standard':
                        return true;
                    case 'limited':
                        return handleExecutionAttempts.call(this);
                    case 'frequent':
                        return handleExecutionFrequency();
                    default:
                        return true;
                }

                function handleExecutionAttempts() {
                    if (executingEvent.handlerExecutionsLeft === 0) {
                        this.off(executingEventName, student);

                        return false;
                    }
                    executingEvent.handlerExecutionsLeft--;

                    return true;
                }
                function handleExecutionFrequency() {
                    if (executingEvent.frequency !== executingEvent.count) {
                        executingEvent.count++;

                        return false;
                    }
                    executingEvent.count = 1;

                    return true;

                }
            }
        },

        /**
         * Подписаться на событие с ограничением по количеству полученных уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} times – сколько раз получить уведомление
         */
        several: function (event, context, handler, times) {
            this.on.apply(this, arguments);
            context.events[event].handlerExecutionsLeft = times;

            return this;
        },

        /**
         * Подписаться на событие с ограничением по частоте получения уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} frequency – как часто уведомлять
         */
        through: function (event, context, handler, frequency) {
            this.on.apply(this, arguments);
            context.events[event].frequency = frequency;
            context.events[event].count = frequency;

            return this;
        }
    };
}
