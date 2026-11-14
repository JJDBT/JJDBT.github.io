/* 给正文里的图片统一加 lazy-load 和 async 解码。
   效果：首屏只加载可视区内的图，下面的图滚动到附近才下载。 */
hexo.extend.filter.register("after_post_render", function (data) {
  if (!data.content) return data;

  data.content = data.content.replace(/<img\b([^>]*)>/gi, function (whole, attrs) {
    if (/\bloading\s*=/.test(attrs)) return whole;

    /* 去掉自闭合的 "/"，否则会拼到行尾变成非法属性 */
    var out = String(attrs).replace(/\/\s*$/, "").replace(/\s+$/, "");

    if (!/\bdecoding\s*=/.test(out)) out += ' decoding="async"';
    out += ' loading="lazy"';

    return "<img" + out + ">";
  });

  return data;
});