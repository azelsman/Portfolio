document.addEventListener('DOMContentLoaded', function () {
  var cta = document.getElementById('cta');
  if (!cta) return;

  function personalizeCta() {
    var context = cta.querySelector('.cta-context');
    var button = cta.querySelector('.cta-button');

    if (!context || !button) return false;

    context.textContent = "If AI is producing more output but not more confidence, let's identify where drift is entering your delivery system.";
    button.textContent = 'Find Where AI Drift Enters';
    return true;
  }

  if (personalizeCta()) return;

  var observer = new MutationObserver(function () {
    if (personalizeCta()) observer.disconnect();
  });

  observer.observe(cta, { childList: true, subtree: true });
});
