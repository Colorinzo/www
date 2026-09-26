(() => {
  const store =
    window.VitrinaStore;

  const loginPanel =
    document.getElementById(
      "loginPanel"
    );

  const adminPanel =
    document.getElementById(
      "adminPanel"
    );

  const password =
    document.getElementById(
      "passwordInput"
    );

  const login =
    document.getElementById(
      "loginButton"
    );

  const error =
    document.getElementById(
      "loginError"
    );

  const form =
    document.getElementById(
      "appForm"
    );

  const list =
    document.getElementById(
      "adminList"
    );

  const importInput =
    document.getElementById(
      "importInput"
    );

  const editingId =
    document.getElementById(
      "editingId"
    );

  const formTitle =
    document.getElementById(
      "formTitle"
    );

  const adminCount =
    document.getElementById(
      "adminCount"
    );

  const LOCAL_PASSWORD =
    "vitrina2026";

  let apps =
    store.load();

  const $ = id =>
    document.getElementById(id);

  /* =========================
     AUTH
  ========================= */

  function isLoggedIn() {
    return (
      sessionStorage.getItem(
        "vitrina.admin"
      ) === "1"
    );
  }

  function showAdmin() {
    loginPanel.hidden = true;
    adminPanel.hidden = false;

    renderList();
  }

  /* =========================
     FORM
  ========================= */

  function resetForm() {
    form.reset();

    editingId.value = "";

    formTitle.textContent =
      "Новое приложение";
  }

  function fillForm(app) {
    editingId.value =
      app.id;

    $("nameInput").value =
      app.name;

    $("descriptionInput").value =
      app.description;

    $("categoryInput").value =
      app.category;

    $("iconInput").value =
      app.icon;

    $("storeInput").value =
      app.storeUrl;

    $("screenshotsInput").value =
      app.screenshots.join(", ");

    $("featuredInput").checked =
      app.featured;

    formTitle.textContent =
      `Изменение: ${app.name}`;

    form.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  /* =========================
     LIST
  ========================= */

  function renderList() {
    adminCount.textContent =
      apps.length;

    list.replaceChildren();

    if (!apps.length) {
      const empty =
        document.createElement(
          "p"
        );

      empty.className =
        "muted";

      empty.textContent =
        "Каталог пуст.";

      list.appendChild(empty);

      return;
    }

    apps.forEach(app => {
      const row =
        document.createElement(
          "div"
        );

      row.className =
        "admin-item";

      const info =
        document.createElement(
          "div"
        );

      info.className =
        "admin-item-info";

      const name =
        document.createElement(
          "strong"
        );

      name.textContent =
        app.name;

      const meta =
        document.createElement(
          "span"
        );

      meta.textContent =
        `${app.category}${
          app.featured
            ? " · избранное"
            : ""
        }`;

      info.append(
        name,
        meta
      );

      const actions =
        document.createElement(
          "div"
        );

      actions.className =
        "admin-item-actions";

      /* EDIT */

      const edit =
        document.createElement(
          "button"
        );

      edit.type = "button";

      edit.textContent =
        "Изменить";

      edit.onclick = () =>
        fillForm(app);

      /* DELETE */

      const remove =
        document.createElement(
          "button"
        );

      remove.type = "button";

      remove.textContent =
        "Удалить";

      remove.onclick = () => {
        if (
          !confirm(
            `Удалить «${app.name}»?`
          )
        ) {
          return;
        }

        apps =
          store.save(
            apps.filter(
              item =>
                item.id !== app.id
            )
          );

        renderList();
      };

      actions.append(
        edit,
        remove
      );

      row.append(
        info,
        actions
      );

      list.appendChild(row);
    });
  }

  /* =========================
     LOGIN
  ========================= */

  login.onclick = () => {
    if (
      password.value ===
      LOCAL_PASSWORD
    ) {
      sessionStorage.setItem(
        "vitrina.admin",
        "1"
      );

      error.hidden = true;

      showAdmin();

      return;
    }

    error.hidden = false;
  };

  password.addEventListener(
    "keydown",
    event => {
      if (event.key === "Enter") {
        login.click();
      }
    }
  );

  /* =========================
     SAVE
  ========================= */

  form.onsubmit = event => {
    event.preventDefault();

    const data = {
      id:
        editingId.value ||
        undefined,

      name:
        $("nameInput").value,

      description:
        $("descriptionInput")
          .value,

      category:
        $("categoryInput").value,

      icon:
        $("iconInput").value,

      storeUrl:
        $("storeInput").value,

      screenshots:
        $("screenshotsInput")
          .value
          .split(",")
          .map(value =>
            value.trim()
          )
          .filter(Boolean),

      featured:
        $("featuredInput")
          .checked
    };

    const normalized =
      store.normalizeApp(
        data,
        apps.length
      );

    if (!normalized) {
      alert(
        "Проверь поля и HTTPS-ссылки."
      );

      return;
    }

    if (editingId.value) {
      apps =
        apps.map(item =>
          item.id ===
          editingId.value
            ? {
                ...normalized,
                id: item.id,
                slug: item.slug
              }
            : item
        );
    } else {
      normalized.id =
        `${normalized.id}-${Date.now()}`;

      normalized.slug =
        `${normalized.slug}-${Date.now()}`;

      apps.push(normalized);
    }

    apps =
      store.save(apps);

    resetForm();
    renderList();
  };

  /* =========================
     CANCEL
  ========================= */

  $("cancelEditButton").onclick =
    resetForm;

  /* =========================
     LOGOUT
  ========================= */

  $("logoutButton").onclick = () => {
    sessionStorage.removeItem(
      "vitrina.admin"
    );

    location.reload();
  };

  /* =========================
     RESET
  ========================= */

  $("resetButton").onclick = () => {
    if (
      !confirm(
        "Сбросить локальный каталог к данным из apps-data.js?"
      )
    ) {
      return;
    }

    apps =
      store.reset();

    resetForm();
    renderList();
  };

  /* =========================
     EXPORT
  ========================= */

  $("exportButton").onclick = () => {
    const blob =
      new Blob(
        [
          JSON.stringify(
            apps,
            null,
            2
          )
        ],
        {
          type:
            "application/json"
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      "vitrina-apps.json";

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();

    setTimeout(
      () =>
        URL.revokeObjectURL(
          url
        ),
      500
    );
  };

  /* =========================
     IMPORT
  ========================= */

  importInput.onchange =
    async () => {
      const file =
        importInput.files?.[0];

      if (!file) {
        return;
      }

      if (
        file.size >
        store.MAX_IMPORT_BYTES
      ) {
        alert(
          "Файл слишком большой."
        );

        importInput.value = "";

        return;
      }

      try {
        const parsed =
          JSON.parse(
            await file.text()
          );

        const clean =
          store.normalizeApps(
            parsed
          );

        if (!clean.length) {
          alert(
            "В JSON нет валидных приложений."
          );

          return;
        }

        apps =
          store.save(clean);

        renderList();

        alert(
          `Импортировано: ${clean.length}`
        );
      } catch {
        alert(
          "Не удалось прочитать JSON."
        );
      }

      importInput.value = "";
    };

  /* =========================
     START
  ========================= */

  if (isLoggedIn()) {
    showAdmin();
  }
})();