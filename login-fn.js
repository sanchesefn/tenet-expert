    function login(){
      return banner("Аттестация отдела продаж","TENET · CHERY")+`
        <h1>Вход<span>фамилия и личный код</span></h1>
        <p class="lead">Код выдаёт РОП. Без него нельзя войти под чужой фамилией.</p>
        <label class="field"><span>Фамилия</span><input id="surname" placeholder="Иванов" autocomplete="username" /></label>
        <label class="field"><span>Личный код</span><input id="loginPin" placeholder="выдаёт РОП" autocomplete="current-password" /></label>
        <div style="margin-top:16px"><button class="btn ivory" id="doLogin">Войти</button></div>
        <p id="loginErr" style="color:var(--primary);font-size:13px"></p>`;
    }
