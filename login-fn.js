    function login(){
      return `<section class="login-box">
        <p class="eyebrow">TENET · CHERY</p>
        <h2 class="login-title">Вход в аттестацию</h2>
        <p class="login-sub">Фамилия и личный код от РОП. Если не входит — откройте сайт в Chrome или Safari, не из Telegram.</p>
        <label class="field"><span>Фамилия</span><input id="surname" placeholder="Иванов" autocomplete="off" autocapitalize="words" autocorrect="off" spellcheck="false" /></label>
        <label class="field"><span>Личный код</span><input id="loginPin" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="8" autocomplete="one-time-code" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="4 цифры" /></label>
        <button class="btn ivory login-btn" id="doLogin">Войти</button>
        <button class="btn ghost login-btn" id="askPin" type="button">Запросить код у РОП</button>
        <p id="loginErr" class="login-err"></p>
      </section>`;
    }
