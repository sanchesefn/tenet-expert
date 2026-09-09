    function login(){
      return `<section class="login-box">
        <p class="eyebrow">TENET · CHERY</p>
        <h2 class="login-title">Вход в аттестацию</h2>
        <p class="login-sub">Фамилия и личный код от РОП</p>
        <label class="field"><span>Фамилия</span><input id="surname" placeholder="Иванов" autocomplete="username" /></label>
        <label class="field"><span>Личный код</span><input id="loginPin" placeholder="4 цифры" inputmode="numeric" autocomplete="current-password" /></label>
        <button class="btn ivory login-btn" id="doLogin">Войти</button>
        <button class="btn ghost login-btn" id="askPin" type="button">Запросить код у РОП</button>
        <p id="loginErr" class="login-err"></p>
      </section>`;
    }
