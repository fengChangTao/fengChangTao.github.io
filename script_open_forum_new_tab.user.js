// ==UserScript==
// @name         特定论坛链接在新标签页打开 (优化版)
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  在 linux.do 和 pcbeta.com 上强制特定链接在新标签页中打开，性能优化版
// @author       您
// @match        https://linux.do/*
// @match        http://linux.do/*
// @match        https://*.pcbeta.com/*
// @match        http://*.pcbeta.com/*
// @run-at       document-start
// @grant        none
// @downloadURL  https://github.com/fengChangTao/fengChangTao.github.io/raw/refs/heads/main/script_open_forum_new_tab.user.js
// @updateURL    https://github.com/fengChangTao/fengChangTao.github.io/raw/refs/heads/main/script_open_forum_new_tab.user.js
// ==/UserScript==

(function() {
    'use strict';

    // 需要匹配的URL模式
    const urlPatterns = [
        // linux.do
        /^https:\/\/linux\.do\/t\/topic\/.*/,
        /^https:\/\/linux\.do\/tag\/.*/,

        // pcbeta.com
        // 优化：放宽了 viewthread 的匹配，兼容翻页链接 (viewthread-数字-数字-数字)
        /^https?:\/\/.*pcbeta\.com\/viewthread-.*\.html/,
        /^https?:\/\/.*pcbeta\.com\/thread-.*/,
        /^https?:\/\/.*pcbeta\.com\/forum-.*/
    ];

    function processLinks() {
        const links = document.getElementsByTagName('a');
        for (let i = 0; i < links.length; i++) {
            const link = links[i];

            // 性能优化：如果已经处理过，直接跳过正则计算，极大降低CPU占用
            if (link.dataset.processedByScript) {
                continue;
            }

            const href = link.href;
            for (const pattern of urlPatterns) {
                if (pattern.test(href)) {
                    link.setAttribute('target', '_blank');
                    link.setAttribute('rel', 'noopener noreferrer');
                    
                    // 标记为已处理
                    link.dataset.processedByScript = 'true';

                    link.addEventListener('click', function(e) {
                        e.preventDefault();
                        window.open(this.href, '_blank', 'noopener,noreferrer');
                    });
                    
                    break; 
                }
            }
        }
    }

    // 初始化逻辑保持不变
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            processLinks();
            setupObserver();
        });
    } else {
        processLinks();
        setupObserver();
    }

    function setupObserver() {
        const observer = new MutationObserver(function(mutations) {
            let shouldProcess = false;
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    shouldProcess = true;
                }
            });
            if (shouldProcess) {
                processLinks();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    setInterval(processLinks, 2000);
})();
