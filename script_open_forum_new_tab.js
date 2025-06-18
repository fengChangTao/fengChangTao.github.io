// ==UserScript==
// @name         特定论坛链接在新标签页打开
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  对 linux.do 和 pcbeta.com 网站的特定链接在新标签页中打开
// @author       您
// @match        https://linux.do/*
// @match        http://linux.do/*
// @match        https://www.pcbeta.com/*
// @match        http://www.pcbeta.com/*
// @match        https://pcbeta.com/*
// @match        http://pcbeta.com/*
// @match        https://bbs.pcbeta.com/*
// @match        http://bbs.pcbeta.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 需要匹配的URL模式（使用正则表达式）
    const urlPatterns = [
        // linux.do 的链接模式
        /^https:\/\/linux\.do\/t\/topic\/.*/, // 匹配 linux.do topic 链接
        /^https:\/\/linux\.do\/tag\/.*/,      // 匹配 linux.do tag 链接

        // pcbeta.com 的链接模式 - 只匹配中间数字为1的viewthread链接
        /^https?:\/\/(www\.|bbs\.)?pcbeta\.com\/viewthread-\d+-1-\d+\.html$/, // 只匹配 viewthread-数字-1-数字.html 格式
        /^https?:\/\/(www\.|bbs\.)?pcbeta\.com\/thread-.*/, // 匹配 thread- 开头的链接
        /^https?:\/\/(www\.|bbs\.)?pcbeta\.com\/forum-.*/, // 匹配 forum- 开头的链接
    ];

    // 处理所有链接的函数
    function processLinks() {
        const links = document.getElementsByTagName('a');
        for (let i = 0; i < links.length; i++) {
            const link = links[i];
            const href = link.href;

            // 检查链接是否匹配任何一个指定的URL模式
            for (const pattern of urlPatterns) {
                if (pattern.test(href)) {
                    link.setAttribute('target', '_blank');
                    link.setAttribute('rel', 'noopener noreferrer');

                    // 添加点击事件处理，确保链接在新标签打开 (只添加一次)
                    if (!link.dataset.processedByScript) {
                        link.dataset.processedByScript = 'true';
                        link.addEventListener('click', function(e) {
                            e.preventDefault();
                            window.open(this.href, '_blank', 'noopener,noreferrer');
                        });
                    }
                    break; // 如果匹配到一个模式，则跳出内部循环
                }
            }
        }
    }

    // 在DOM准备好后立即执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            processLinks();
            setupObserver();
        });
    } else {
        processLinks();
        setupObserver();
    }

    // 设置观察器监听DOM变化，处理动态加载的内容
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

        // 配置和启动观察器
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // 定期检查新链接，应对某些动态加载的网站
    setInterval(processLinks, 2000);
})();
