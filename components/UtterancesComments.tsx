function checkExist() {
  return document.querySelector('iframe.utterances-frame');
}

export const UtterancesComments: React.FC = () => (
  <section
    className="utterances-comments-hook"
    ref={(elem) => {
      if (!elem || checkExist()) {
        return;
      }
      const scriptElem = document.createElement('script');
      scriptElem.src = 'https://utteranc.es/client.js';
      scriptElem.async = true;
      scriptElem.crossOrigin = 'anonymous';
      scriptElem.setAttribute('repo', 'Hilshire/hermit-crab');
      scriptElem.setAttribute('issue-term', 'title');
      scriptElem.setAttribute('theme', 'photon-dark');
      elem.appendChild(scriptElem);
    }}
  />
);
