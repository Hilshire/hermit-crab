import Link from 'next/link';

function AboutMe() {
  return (
    <div className="about-me">
      <p>嗯？欢迎。</p>

      <p>我是 hilshire ，是一名普通的前端，过于平凡以至于没什么可以介绍的。</p>

      <p>这是我的 blog ，会记录一些技术心得和随想。</p>

      <p>我还是一名跑团爱好者，主要使用 d&d3.5 规则</p>

      <p>如果你感兴趣的话，这里有我跑团的文档和工具：</p>

      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <Link href="https://small-ruin.github.io/"><a target="_blank">hilshire 的房规</a></Link>
    </div>
  );
}

export default AboutMe;
