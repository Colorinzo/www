(() => {
  "use strict";

  window.VITRINA_DATA = {
    categories: [
      { id: "games", label: "Игры" },
      { id: "productivity", label: "Продуктивность" },
      { id: "health", label: "Здоровье" },
      { id: "entertainment", label: "Развлечения" },
      { id: "utilities", label: "Утилиты" }
    ],

    seedApps: [
      {
        id: "pushr",
        name: "Pushr",
        category: "productivity",
        tagline: "Пуш-уведомления без лишнего шума.",
        description: "Минималистичный инструмент для личных уведомлений и небольших напоминаний.",
        iconUrl: "https://placehold.co/512x512/png?text=P",
        storeUrl: "#",
        screenshots: [],
        featured: true,
        releaseDate: "2026-01-15"
      },
      {
        id: "stardew-valley",
        name: "Stardew Valley",
        category: "games",
        tagline: "Тёплая ферма, большая история.",
        description: "Расслабляющая фермерская RPG с исследованием, отношениями и множеством способов провести игровой день.",
        iconUrl: "https://placehold.co/512x512/png?text=S",
        storeUrl: "#",
        screenshots: [],
        featured: false,
        releaseDate: "2025-01-01"
      },
      {
        id: "chatgpt",
        name: "ChatGPT",
        category: "utilities",
        tagline: "Помощник для идей, текста и задач.",
        description: "Универсальный AI-помощник для поиска идей, работы с текстом, обучения и решения повседневных задач.",
        iconUrl: "https://placehold.co/512x512/png?text=C",
        storeUrl: "#",
        screenshots: [],
        featured: false,
        releaseDate: "2025-01-01"
      }
    ]
  };
})();
