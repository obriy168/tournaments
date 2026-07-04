import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  en: {
    translation: {
      header: {
        signup: "Sign Up",
        login: "Log In",
      },
      footer: {
        tagline: "Online tournaments platform",
        account: "Account",
        privacy: "Privacy and Cookie Policy",
        terms: "Terms of Service",
      },
      sidebar: {
        mainbtns: {
          profile: "Profile",
          logout: "Log out",
        },
        btns: {
          dashboard: "Dashboard",
          tournaments: "Tournaments",
          tournament: "Tournament",
          teams: "Teams",
          tasks: "Tasks",
          submissions: "Submissions",
          jury: "Jury",
          assignments: "Assignments",
          evaluation: "Evaluation",
          myTeam: "My Team",
        },
      },
      tournamentSwitcher: {
        loading: "Loading…",
        label: "Active Tournament",
        allTournaments: "All Tournaments",
      },
      mainpage: {
        hero: {
          title: "Welcome to Skyline",
          description:
            "Join the world's most prestigious online programming tournaments.",
          button: "Join a Tournament",
        },
        tournaments: {
          title: "Active Tournaments",
          description: "Check out the tournaments currently in progress.",
          loading: "Loading tournaments…",
          retry: "Retry",
          empty: "No tournaments match your criteria.",
          dates: {
            opens: "Registration opens",
            closes: "Registration closes",
            starts: "Tournament starts",
          },
          status: {
            registration: "Registration",
            running: "Running",
            finished: "Finished",
            draft: "Draft",
          },
          registrationClosed: "Registration Closed",
          finished: "Finished",
          filters: {
            all: "All",
            registration: "Registration",
            running: "Running",
            finished: "Finished",
          },
          search: {
            placeholder: "Search tournaments...",
          },
          showAll: "Show all {{count}} tournaments",
        },
      },
      signuppage: {
        title: "Create an account",
        firstname: "First name",
        lastname: "Last name",
        email: "Email",
        password: "Password",
        showPassword: "Show password",
        hidePassword: "Hide password",
        submit: "Sign up",
        submitting: "Signing up…",
        loginPrompt: "Already have an account?",
        termsAgree: "I agree to the",
        and: "and",
        autoLoginFailed: "Account created. Please log in manually.",
        errors: {
          firstNameRequired: "First name is required",
          lastNameRequired: "Last name is required",
          invalidEmail: "Invalid email address",
          passwordMin: "Password must be at least 8 characters",
          acceptTerms: "You must accept the Terms of Use and Privacy Policy",
        },
      },
      loginpage: {
        title: "Welcome back",
        email: "Email",
        password: "Password",
        showPassword: "Show password",
        hidePassword: "Hide password",
        submit: "Log in",
        submitting: "Logging in…",
        signupPrompt: "Don't have an account?",
        signupLink: "Sign up",
        errors: {
          invalidEmail: "Invalid email address",
          passwordRequired: "Password is required",
        },
      },
      profilepage: {
        loading: "Loading profile…",
        title: "Profile",
        name: "Name",
        email: "Email",
        role: "Role",
        team: "Team",
        tournament: "Tournament",
        logout: "Log out",
      },
      privacyCookiePage: {
        title: "Privacy and Cookie Policy",
        effectiveDate: "Effective Date: May 6, 2026",
        lastUpdated: "Last updated: May 6, 2026",
        sections: [
          {
            title: "1. Introduction",
            content: `<p>This Privacy and Cookie Policy describes how our programming tournament platform (the "Platform") collects, uses, stores, and protects personal data of users: team participants, jury members, administrators, and organizers. It also explains how we use cookies and similar technologies.</p>`,
          },
          {
            title: "2. Information We Collect",
            content: `<p><strong>Information You Provide:</strong> Full name, email address, team name and member list, city/school/organization (optional), contact info (Telegram, Discord), GitHub repository links, video demos, live demo links, scores, comments, and feedback.</p><p><strong>Automatically Collected:</strong> IP address, browser type, operating system, visit timestamps, actions on the platform, cookies.</p>`,
          },
          {
            title: "3. How We Use Your Information",
            content: `<p>We use your data to operate the platform, manage tournaments and rounds, generate leaderboards, send notifications about deadlines and statuses, enforce security, prevent fraud, and improve our services.</p>`,
          },
          {
            title: "4. Legal Basis",
            content: `<p>Data processing is based on your consent (provided during registration), contractual necessity (tournament participation), and legitimate interests (security, analytics).</p>`,
          },
          {
            title: "5. Data Sharing",
            content: `<p>We do not sell personal data. We may share it with tournament organizers, jury members (for evaluation), technical service providers (hosting, email, analytics), and competent authorities as required by Ukrainian law.</p>`,
          },
          {
            title: "6. Data Retention",
            content: `<p>Data is retained as long as necessary for the purposes outlined herein. Accounts may be deleted upon request, except where we are legally obligated to retain them. Tournament submissions and results may be preserved in archives without linkage to personal data.</p>`,
          },
          {
            title: "7. Your Rights",
            content: `<p>You have the right to access, correct, delete, or export your personal data; restrict or object to processing; and withdraw consent. Contact us at obriy168@gmail.com to exercise these rights.</p>`,
          },
          {
            title: "8. Security",
            content: `<p>We implement encryption, access controls, regular backups, and threat monitoring to protect your data.</p>`,
          },
          {
            title: "9. International Transfers",
            content: `<p>When using cloud services, data may be processed outside Ukraine. We ensure adequate protection through standard contractual clauses.</p>`,
          },
          {
            title: "10. Cookies",
            content: `<p>We use cookies and similar technologies to maintain your session, remember your preferences, and understand how you interact with our platform.</p>`,
          },
          {
            title: "11. Types of Cookies We Use",
            type: "table",
            table: {
              headers: ["Type", "Purpose", "Examples"],
              rows: [
                [
                  "Strictly Necessary",
                  "Essential platform functionality",
                  "Authentication, sessions, CSRF tokens, tournament state",
                ],
                [
                  "Functional",
                  "Enhanced user experience",
                  "Language preferences, display settings",
                ],
                [
                  "Analytics",
                  "Understanding platform usage",
                  "Google Analytics, internal analytics (anonymized)",
                ],
                [
                  "Preferences",
                  "Remembering your choices",
                  "Cookie consent, tournament filters",
                ],
              ],
            },
          },
          {
            title: "12. Managing Cookies",
            content: `<p>A consent banner is displayed on your first visit (except for strictly necessary cookies). You may accept all, reject non-essential, or customize your choices. Settings can be changed at any time via your browser settings or through the cookie settings link in the footer.</p>`,
          },
          {
            title: "13. Third-Party Cookies",
            content: `<p>We may use third-party services (e.g., for video hosting, analytics). These services may set their own cookies in accordance with their policies.</p>`,
          },
          {
            title: "14. Cookie Retention",
            content: `<p>Session cookies are deleted when you close your browser. Persistent cookies remain from several days up to 1 year depending on their purpose.</p>`,
          },
          {
            title: "15. Changes",
            content: `<p>We may update this Policy at any time. Changes are posted on this page with a revised effective date. Continued use constitutes acceptance.</p>`,
          },
          {
            title: "16. Contact",
            content: `<p>For any questions: <strong>obriy168@gmail.com</strong></p>`,
          },
        ],
      },
      termsPage: {
        title: "Terms of Service",
        effectiveDate: "Effective Date: May 6, 2026",
        lastUpdated: "Last updated: May 6, 2026",
        sections: [
          {
            title: "1. General Provisions",
            content: `<p>1.1. These Terms govern your use of the programming tournament platform (the "Platform").</p><p>1.2. By using the Platform, you agree to these Terms and our Privacy and Cookie Policy.</p><p>1.3. The Platform does not impose strict age restrictions for access. However, participants are obligated to refrain from posting materials that may be deemed inappropriate, offensive, or infringing upon the rights of third parties.</p>`,
          },
          {
            title: "2. Account Ownership and Liability Disclaimer",
            content: `<p><strong>2.1. Account Ownership.</strong> Your account is not your property. The Platform grants you a limited, revocable license to use the account. We reserve the right to suspend, restrict, or terminate any account at our sole discretion, with or without notice.</p><p><strong>2.2. Data Loss.</strong> The Platform is provided "as is." We make no guarantees regarding data integrity, availability, or persistence. If the database fails, data is lost, or your account becomes inaccessible for any reason, the Platform and its operators <strong>shall not be held liable</strong>. You are solely responsible for maintaining backups of any content you submit.</p><p><strong>2.3. No Warranty.</strong> The Platform is provided without warranties of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.</p>`,
          },
          {
            title: "3. User Roles and Accounts",
            content: `<p><strong>3.1. User Types:</strong></p><p><strong>Administrator/Organizer</strong> — creates and manages tournaments, rounds, tasks, and assigns works to jury.</p><p><strong>Team (Participant)</strong> — registers a team and submits solutions within tournaments.</p><p><strong>Jury</strong> — evaluates works according to established criteria.</p><p><strong>3.2. Registration:</strong> You agree to provide accurate and current information. Multiple accounts or duplicate registrations (same captain or email set) are prohibited. You are responsible for maintaining the confidentiality of your credentials.</p>`,
          },
          {
            title: "4. Tournament Rules",
            content: `<p><strong>4.1. Team Registration:</strong> Available only within the time window set by the administrator. Minimum team size: 2 members (unless otherwise specified). After registration closes, team roster changes are prohibited unless approved by an administrator.</p><p><strong>4.2. Submissions:</strong> Teams must provide a GitHub repository link and a video demonstration. Editing submissions is allowed until the round deadline. After the deadline, submissions are locked (SubmissionClosed status). Teams are responsible for the functionality of provided links.</p><p><strong>4.3. Evaluation:</strong> Jury evaluates works objectively per administrator-defined criteria. Each work is evaluated by at least the minimum number of jury members set by the administrator. Evaluating your own work or your team's work is strictly prohibited.</p>`,
          },
          {
            title: "5. Intellectual Property",
            content: `<p><strong>5.1. Platform Content:</strong> Design, code, logos, and Platform structure belong to its owners. Copying, modifying, or distributing without permission is prohibited.</p><p><strong>5.2. User Content:</strong> Submissions (code, videos, descriptions) remain team property. By submitting, you grant the Platform a license to store, display to jury, and publish results. The administrator may include submissions in the archive of completed tournaments.</p>`,
          },
          {
            title: "6. Content Moderation and User Responsibility",
            content: `<p><strong>6.1. User-Generated Content.</strong> All content uploaded, posted, or shared by users (including submissions, comments, team descriptions, and links) is the <strong>sole responsibility</strong> of the user who posted it. The Platform acts as a passive intermediary and does not pre-screen all user content.</p><p><strong>6.2. Moderation Efforts.</strong> The administration strives to maintain a safe environment and applies software tools for filtering and moderating uploaded content (including profanity filters). However, the existence of such tools <strong>does not relieve the user of responsibility</strong> for the content of their materials and their compliance with ethical norms and applicable law.</p><p><strong>6.3. No Endorsement or Guarantee.</strong> The organizer does not guarantee the accuracy, completeness, or safety of content posted by other participants, and <strong>shall not be liable for any consequences</strong> arising from its use. The Platform does not endorse, verify, or assume responsibility for any user-generated content, including code repositories, video demonstrations, or external links.</p>`,
          },
          {
            title: "7. Prohibited Conduct",
            content: `<p>Hacking, unauthorized access attempts, DDoS attacks, plagiarism, presenting others' work as your own, score manipulation, jury bribery, distribution of malware through submissions, discrimination, harassment, abuse of other participants, automated data collection (scraping) without permission, and posting content that is illegal, defamatory, obscene, or infringing on third-party rights.</p>`,
          },
          {
            title: "8. Enforcement and Sanctions",
            content: `<p>The administrator may disqualify teams for violations. In cases of fraud, results may be annulled. Accounts may be suspended for serious violations. Administrator decisions regarding specific tournaments are final.</p>`,
          },
          {
            title: "9. Termination and Changes",
            content: `<p>We may modify these Terms with user notification. You may delete your account at any time. We reserve the right to suspend or discontinue the Platform with notice.</p>`,
          },
          {
            title: "10. Governing Law and Dispute Resolution",
            content: `<p>These Terms are governed by the laws of <strong>Ukraine</strong>. Disputes shall be resolved through negotiation; if impossible, in the competent courts of Ukraine.</p>`,
          },
          {
            title: "11. Contact Information",
            content: `<p>For any questions: <strong>obriy168@gmail.com</strong></p>`,
          },
        ],
      },
    },
  },
  ru: {
    translation: {
      header: {
        signup: "Регистрация",
        login: "Войти",
      },
      footer: {
        tagline: "Платформа онлайн-турниров",
        account: "Аккаунт",
        privacy: "Политика конфиденциальности и файлы cookie",
        terms: "Условия использования",
      },
      sidebar: {
        mainbtns: {
          profile: "Профиль",
          logout: "Выйти",
        },
        btns: {
          dashboard: "Панель",
          tournaments: "Турниры",
          tournament: "Турнир",
          teams: "Команды",
          tasks: "Задачи",
          submissions: "Решения",
          jury: "Жюри",
          assignments: "Назначения",
          evaluation: "Оценивание",
          myTeam: "Моя команда",
        },
      },
      tournamentSwitcher: {
        loading: "Загрузка…",
        label: "Активный турнир",
        allTournaments: "Все турниры",
      },
      mainpage: {
        hero: {
          title: "Добро пожаловать в Skyline",
          description:
            "Присоединяйтесь к самым престижным онлайн-турнирам по программированию.",
          button: "Принять участие",
        },
        tournaments: {
          title: "Активные турниры",
          description: "Посмотрите турниры, которые проходят прямо сейчас.",
          loading: "Загрузка турниров…",
          retry: "Повторить",
          empty: "Нет турниров по вашему запросу.",
          dates: {
            opens: "Регистрация открывается",
            closes: "Регистрация закрывается",
            starts: "Турнир начинается",
          },
          status: {
            registration: "Регистрация",
            running: "Идёт",
            finished: "Завершён",
            draft: "Черновик",
          },
          registrationClosed: "Регистрация закрыта",
          finished: "Завершён",
          filters: {
            all: "Все",
            registration: "Регистрация",
            running: "Идёт",
            finished: "Завершён",
          },
          search: {
            placeholder: "Поиск турниров...",
          },
          showAll: "Показать все {{count}} турниров",
        },
      },
      signuppage: {
        title: "Создать аккаунт",
        firstname: "Имя",
        lastname: "Фамилия",
        email: "Email",
        password: "Пароль",
        showPassword: "Показать пароль",
        hidePassword: "Скрыть пароль",
        submit: "Зарегистрироваться",
        submitting: "Регистрация…",
        loginPrompt: "Уже есть аккаунт?",
        termsAgree: "Я принимаю",
        and: "и",
        autoLoginFailed: "Аккаунт создан. Пожалуйста, войдите вручную.",
        errors: {
          firstNameRequired: "Имя обязательно",
          lastNameRequired: "Фамилия обязательна",
          invalidEmail: "Некорректный email",
          passwordMin: "Пароль должен содержать минимум 8 символов",
          acceptTerms:
            "Вы должны принять Условия использования и Политику конфиденциальности",
        },
      },
      loginpage: {
        title: "С возвращением",
        email: "Email",
        password: "Пароль",
        showPassword: "Показать пароль",
        hidePassword: "Скрыть пароль",
        submit: "Войти",
        submitting: "Вход…",
        signupPrompt: "Нет аккаунта?",
        signupLink: "Зарегистрироваться",
        errors: {
          invalidEmail: "Некорректный email",
          passwordRequired: "Пароль обязателен",
        },
      },
      profilepage: {
        loading: "Загрузка профиля…",
        title: "Профиль",
        name: "Имя",
        email: "Email",
        role: "Роль",
        team: "Команда",
        tournament: "Турнир",
        logout: "Выйти",
      },
      privacyCookiePage: {
        title: "Политика конфиденциальности и использования файлов cookie",
        effectiveDate: "Дата вступления в силу: 6 мая 2026 г.",
        lastUpdated: "Последнее обновление: 6 мая 2026 г.",
        sections: [
          {
            title: "1. Введение",
            content: `<p>Настоящая Политика конфиденциальности и использования файлов cookie описывает, как наша платформа для турниров по программированию («Платформа») собирает, использует, хранит и защищает персональные данные пользователей: участников команд, членов жюри, администраторов и организаторов. В ней также объясняется, как мы используем файлы cookie и аналогичные технологии.</p>`,
          },
          {
            title: "2. Информация, которую мы собираем",
            content: `<p><strong>Информация, которую вы предоставляете:</strong> Имя и фамилия, адрес электронной почты, название команды и список участников, город/школа/организация (по желанию), контактная информация (Telegram, Discord), ссылки на репозитории GitHub, видеодемонстрации, ссылки на живые демо, оценки, комментарии и отзывы.</p><p><strong>Автоматически собираемая информация:</strong> IP-адрес, тип браузера, операционная система, время посещения, действия на платформе, файлы cookie.</p>`,
          },
          {
            title: "3. Как мы используем вашу информацию",
            content: `<p>Мы используем ваши данные для обеспечения работы платформы, управления турнирами и раундами, формирования таблиц лидеров, отправки уведомлений о сроках и статусах, обеспечения безопасности, предотвращения мошенничества и улучшения наших услуг.</p>`,
          },
          {
            title: "4. Правовое основание",
            content: `<p>Обработка данных осуществляется на основании вашего согласия (данного при регистрации), необходимости исполнения договора (участие в турнире) и законных интересов (безопасность, аналитика).</p>`,
          },
          {
            title: "5. Передача данных",
            content: `<p>Мы не продаем персональные данные. Мы можем передавать их организаторам турниров, членам жюри (для оценки), поставщикам технических услуг (хостинг, электронная почта, аналитика) и компетентным органам в соответствии с законодательством Украины.</p>`,
          },
          {
            title: "6. Хранение данных",
            content: `<p>Данные хранятся столько, сколько необходимо для целей, описанных в настоящей Политике. Аккаунты могут быть удалены по запросу, за исключением случаев, когда мы обязаны хранить их по закону. Результаты турниров и представленные работы могут храниться в архивах без привязки к персональным данным.</p>`,
          },
          {
            title: "7. Ваши права",
            content: `<p>Вы имеете право на доступ, исправление, удаление или экспорт ваших персональных данных; ограничение или возражение против обработки; отзыв согласия. Для осуществления этих прав свяжитесь с нами по адресу obriy168@gmail.com.</p>`,
          },
          {
            title: "8. Безопасность",
            content: `<p>Мы внедряем шифрование, контроль доступа, регулярное резервное копирование и мониторинг угроз для защиты ваших данных.</p>`,
          },
          {
            title: "9. Международная передача",
            content: `<p>При использовании облачных сервисов данные могут обрабатываться за пределами Украины. Мы обеспечиваем надлежащую защиту посредством стандартных договорных положений.</p>`,
          },
          {
            title: "10. Файлы cookie",
            content: `<p>Мы используем файлы cookie и аналогичные технологии для поддержания вашей сессии, запоминания ваших предпочтений и понимания того, как вы взаимодействуете с нашей платформой.</p>`,
          },
          {
            title: "11. Типы используемых файлов cookie",
            type: "table",
            table: {
              headers: ["Тип", "Цель", "Примеры"],
              rows: [
                [
                  "Строго необходимые",
                  "Обеспечение основной функциональности платформы",
                  "Аутентификация, сессии, CSRF-токены, состояние турнира",
                ],
                [
                  "Функциональные",
                  "Улучшение пользовательского опыта",
                  "Языковые предпочтения, настройки отображения",
                ],
                [
                  "Аналитические",
                  "Понимание использования платформы",
                  "Google Analytics, внутренняя аналитика (анонимизированная)",
                ],
                [
                  "Предпочтения",
                  "Запоминание ваших выборов",
                  "Согласие на cookie, фильтры турниров",
                ],
              ],
            },
          },
          {
            title: "12. Управление файлами cookie",
            content: `<p>При первом посещении отображается баннер согласия (кроме строго необходимых файлов cookie). Вы можете принять все, отклонить необязательные или настроить свой выбор. Настройки можно изменить в любое время через настройки браузера или по ссылке настройки cookie в нижнем колонтитуле.</p>`,
          },
          {
            title: "13. Сторонние файлы cookie",
            content: `<p>Мы можем использовать сторонние сервисы (например, для видеохостинга, аналитики). Эти сервисы могут устанавливать собственные файлы cookie в соответствии со своими политиками.</p>`,
          },
          {
            title: "14. Срок действия файлов cookie",
            content: `<p>Сессионные файлы cookie удаляются при закрытии браузера. Постоянные файлы cookie хранятся от нескольких дней до 1 года в зависимости от их назначения.</p>`,
          },
          {
            title: "15. Изменения",
            content: `<p>Мы можем обновлять эту Политику в любое время. Изменения публикуются на этой странице с указанием новой даты вступления в силу. Продолжение использования означает принятие изменений.</p>`,
          },
          {
            title: "16. Контакты",
            content: `<p>По любым вопросам: <strong>obriy168@gmail.com</strong></p>`,
          },
        ],
      },
      termsPage: {
        title: "Условия использования",
        effectiveDate: "Дата вступления в силу: 6 мая 2026 г.",
        lastUpdated: "Последнее обновление: 6 мая 2026 г.",
        sections: [
          {
            title: "1. Общие положения",
            content: `<p>1.1. Настоящие Условия регулируют использование вами платформы для турниров по программированию («Платформа»).</p><p>1.2. Используя Платформу, вы соглашаетесь с настоящими Условиями и Политикой конфиденциальности и файлов cookie.</p><p>1.3. Платформа не устанавливает строгих возрастных ограничений для доступа. Однако участники обязуются воздерживаться от размещения материалов, которые могут считаться неприемлемыми, оскорбительными или нарушающими права третьих лиц.</p>`,
          },
          {
            title:
              "2. Право собственности на аккаунт и отказ от ответственности",
            content: `<p><strong>2.1. Право собственности на аккаунт.</strong> Ваш аккаунт не является вашей собственностью. Платформа предоставляет вам ограниченную, отзывную лицензию на использование аккаунта. Мы оставляем за собой право приостановить, ограничить или прекратить действие любого аккаунта по нашему собственному усмотрению, с уведомлением или без него.</p><p><strong>2.2. Потеря данных.</strong> Платформа предоставляется «как есть». Мы не даем никаких гарантий относительно целостности, доступности или сохранности данных. Если база данных выйдет из строя, данные будут потеряны или ваш аккаунт станет недоступным по какой-либо причине, Платформа и ее операторы <strong>не несут ответственности</strong>. Вы несете полную ответственность за сохранение резервных копий любого размещаемого вами контента.</p><p><strong>2.3. Отсутствие гарантий.</strong> Платформа предоставляется без каких-либо гарантий, явных или подразумеваемых, включая, помимо прочего, гарантии товарной пригодности, пригодности для определенной цели или ненарушения прав.</p>`,
          },
          {
            title: "3. Роли пользователей и аккаунты",
            content: `<p><strong>3.1. Типы пользователей:</strong></p><p><strong>Администратор/Организатор</strong> — создает и управляет турнирами, раундами, заданиями и назначает работы жюри.</p><p><strong>Команда (Участник)</strong> — регистрирует команду и подает решения в рамках турниров.</p><p><strong>Жюри</strong> — оценивает работы в соответствии с установленными критериями.</p><p><strong>3.2. Регистрация:</strong> Вы соглашаетесь предоставлять точную и актуальную информацию. Запрещены множественные аккаунты или повторные регистрации (один капитан или набор email). Вы несете ответственность за сохранение конфиденциальности ваших учетных данных.</p>`,
          },
          {
            title: "4. Правила турниров",
            content: `<p><strong>4.1. Регистрация команд:</strong> Доступна только в течение временного окна, установленного администратором. Минимальный размер команды: 2 участника (если не указано иное). После закрытия регистрации изменения в составе команды запрещены, если это не одобрено администратором.</p><p><strong>4.2. Представление работ:</strong> Команды должны предоставить ссылку на GitHub-репозиторий и видеодемонстрацию. Редактирование представленных работ разрешено до окончания раунда. После окончания срока подачи работы блокируются (статус SubmissionClosed). Команды несут ответственность за работоспособность предоставленных ссылок.</p><p><strong>4.3. Оценка:</strong> Жюри оценивает работы объективно в соответствии с критериями, определенными администратором. Каждая работа оценивается как минимум минимальным количеством членов жюри, установленным администратором. Оценивать свою собственную работу или работу своей команды строго запрещено.</p>`,
          },
          {
            title: "5. Интеллектуальная собственность",
            content: `<p><strong>5.1. Контент Платформы:</strong> Дизайн, код, логотипы и структура Платформы принадлежат ее владельцам. Копирование, изменение или распространение без разрешения запрещено.</p><p><strong>5.2. Пользовательский контент:</strong> Представленные работы (код, видео, описания) остаются собственностью команды. Отправляя работу, вы предоставляете Платформе лицензию на хранение, показ жюри и публикацию результатов. Администратор может включать представленные работы в архив завершенных турниров.</p>`,
          },
          {
            title: "6. Модерация контента и ответственность пользователей",
            content: `<p><strong>6.1. Пользовательский контент.</strong> Весь контент, загружаемый, публикуемый или распространяемый пользователями (включая решения, комментарии, описания команд и ссылки), является <strong>исключительной ответственностью</strong> пользователя, который его разместил. Платформа выступает как пассивный посредник и не предварительно проверяет весь пользовательский контент.</p><p><strong>6.2. Модерационные усилия.</strong> Администрация стремится поддерживать безопасную среду и применяет программные средства для фильтрации и модерации загружаемого контента (включая фильтры ненормативной лексики). Однако наличие таких инструментов <strong>не освобождает пользователя от ответственности</strong> за содержание своих материалов и их соответствие этическим нормам и применимому законодательству.</p><p><strong>6.3. Отсутствие одобрения или гарантий.</strong> Организатор не гарантирует точность, полноту или безопасность контента, размещенного другими участниками, и <strong>не несет ответственности за любые последствия</strong>, возникающие в связи с его использованием. Платформа не одобряет, не проверяет и не берет на себя ответственность за любой пользовательский контент, включая репозитории кода, видеодемонстрации или внешние ссылки.</p>`,
          },
          {
            title: "7. Запрещенное поведение",
            content: `<p>Взлом, попытки несанкционированного доступа, DDoS-атаки, плагиат, выдача чужой работы за свою, манипуляция результатами, подкуп жюри, распространение вредоносного ПО через представленные работы, дискриминация, домогательства, оскорбления других участников, автоматический сбор данных (скрапинг) без разрешения, размещение контента, который является незаконным, клеветническим, непристойным или нарушающим права третьих лиц.</p>`,
          },
          {
            title: "8. Правоприменение и санкции",
            content: `<p>Администратор может дисквалифицировать команды за нарушения. В случае мошенничества результаты могут быть аннулированы. Аккаунты могут быть приостановлены за серьезные нарушения. Решения администратора по конкретным турнирам являются окончательными.</p>`,
          },
          {
            title: "9. Прекращение действия и изменения",
            content: `<p>Мы можем изменять настоящие Условия с уведомлением пользователей. Вы можете удалить свой аккаунт в любое время. Мы оставляем за собой право приостановить или прекратить работу Платформы с уведомлением.</p>`,
          },
          {
            title: "10. Применимое право и разрешение споров",
            content: `<p>Настоящие Условия регулируются законодательством <strong>Украины</strong>. Споры разрешаются путем переговоров; если это невозможно, в компетентных судах Украины.</p>`,
          },
          {
            title: "11. Контактная информация",
            content: `<p>По всем вопросам: <strong>obriy168@gmail.com</strong></p>`,
          },
        ],
      },
    },
  },
  pl: {
    translation: {
      header: {
        signup: "Zarejestruj się",
        login: "Zaloguj się",
      },
      footer: {
        tagline: "Platforma turniejów online",
        account: "Konto",
        privacy: "Polityka prywatności i pliki cookie",
        terms: "Warunki korzystania z usługi",
      },
      sidebar: {
        mainbtns: {
          profile: "Profil",
          logout: "Wyloguj się",
        },
        btns: {
          dashboard: "Panel",
          tournaments: "Turnieje",
          tournament: "Turniej",
          teams: "Zespoły",
          tasks: "Zadania",
          submissions: "Zgłoszenia",
          jury: "Jury",
          assignments: "Przydziały",
          evaluation: "Ocena",
          myTeam: "Mój zespół",
        },
      },
      tournamentSwitcher: {
        loading: "Ładowanie…",
        label: "Aktywny turniej",
        allTournaments: "Wszystkie turnieje",
      },
      mainpage: {
        hero: {
          title: "Witamy w Skyline",
          description:
            "Dołącz do najbardziej prestiżowych turniejów programistycznych online.",
          button: "Dołącz do turnieju",
        },
        tournaments: {
          title: "Aktywne turnieje",
          description: "Sprawdź turnieje, które właśnie trwają.",
          loading: "Ładowanie turniejów…",
          retry: "Spróbuj ponownie",
          empty: "Brak turniejów spełniających kryteria.",
          dates: {
            opens: "Rejestracja otwarta",
            closes: "Rejestracja zamknięta",
            starts: "Turniej startuje",
          },
          status: {
            registration: "Rejestracja",
            running: "W trakcie",
            finished: "Zakończony",
            draft: "Szkic",
          },
          registrationClosed: "Rejestracja zamknięta",
          finished: "Zakończony",
          filters: {
            all: "Wszystkie",
            registration: "Rejestracja",
            running: "W trakcie",
            finished: "Zakończony",
          },
          search: {
            placeholder: "Szukaj turniejów...",
          },
          showAll: "Pokaż wszystkie {{count}} turniejów",
        },
      },
      signuppage: {
        title: "Utwórz konto",
        firstname: "Imię",
        lastname: "Nazwisko",
        email: "E-mail",
        password: "Hasło",
        showPassword: "Pokaż hasło",
        hidePassword: "Ukryj hasło",
        submit: "Zarejestruj się",
        submitting: "Rejestracja…",
        loginPrompt: "Masz już konto?",
        termsAgree: "Akceptuję",
        and: "i",
        autoLoginFailed: "Konto zostało utworzone. Zaloguj się ręcznie.",
        errors: {
          firstNameRequired: "Imię jest wymagane",
          lastNameRequired: "Nazwisko jest wymagane",
          invalidEmail: "Nieprawidłowy adres e-mail",
          passwordMin: "Hasło musi mieć co najmniej 8 znaków",
          acceptTerms:
            "Musisz zaakceptować Warunki korzystania z usługi i Politykę prywatności",
        },
      },
      loginpage: {
        title: "Witaj ponownie",
        email: "E-mail",
        password: "Hasło",
        showPassword: "Pokaż hasło",
        hidePassword: "Ukryj hasło",
        submit: "Zaloguj się",
        submitting: "Logowanie…",
        signupPrompt: "Nie masz konta?",
        signupLink: "Zarejestruj się",
        errors: {
          invalidEmail: "Nieprawidłowy adres e-mail",
          passwordRequired: "Hasło jest wymagane",
        },
      },
      profilepage: {
        loading: "Ładowanie profilu…",
        title: "Profil",
        name: "Nazwa",
        email: "E-mail",
        role: "Rola",
        team: "Zespół",
        tournament: "Turniej",
        logout: "Wyloguj się",
      },
      privacyCookiePage: {
        title: "Polityka prywatności i plików cookie",
        effectiveDate: "Data wejścia w życie: 6 maja 2026 r.",
        lastUpdated: "Ostatnia aktualizacja: 6 maja 2026 r.",
        sections: [
          {
            title: "1. Wprowadzenie",
            content: `<p>Niniejsza Polityka prywatności i plików cookie opisuje, w jaki sposób nasza platforma turniejów programistycznych („Platforma”) zbiera, wykorzystuje, przechowuje i chroni dane osobowe użytkowników: członków zespołów, jurorów, administratorów i organizatorów. Wyjaśnia również, w jaki sposób używamy plików cookie i podobnych technologii.</p>`,
          },
          {
            title: "2. Gromadzone informacje",
            content: `<p><strong>Informacje podawane przez użytkownika:</strong> Imię i nazwisko, adres e-mail, nazwa zespołu i lista członków, miasto/szkoła/organizacja (opcjonalnie), dane kontaktowe (Telegram, Discord), linki do repozytoriów GitHub, demo wideo, linki do wersji demonstracyjnych, oceny, komentarze i opinie.</p><p><strong>Zbierane automatycznie:</strong> Adres IP, typ przeglądarki, system operacyjny, znaczniki czasu wizyt, działania na platformie, pliki cookie.</p>`,
          },
          {
            title: "3. Jak wykorzystujemy dane",
            content: `<p>Wykorzystujemy dane do obsługi platformy, zarządzania turniejami i rundami, tworzenia tabel wyników, wysyłania powiadomień o terminach i statusach, zapewnienia bezpieczeństwa, zapobiegania oszustwom i ulepszania naszych usług.</p>`,
          },
          {
            title: "4. Podstawa prawna",
            content: `<p>Przetwarzanie danych odbywa się na podstawie zgody użytkownika (udzielonej podczas rejestracji), niezbędności umowy (udział w turnieju) oraz uzasadnionego interesu (bezpieczeństwo, analityka).</p>`,
          },
          {
            title: "5. Udostępnianie danych",
            content: `<p>Nie sprzedajemy danych osobowych. Możemy je udostępniać organizatorom turniejów, członkom jury (w celu oceny), dostawcom usług technicznych (hosting, e-mail, analityka) oraz właściwym organom, jeśli wymaga tego prawo ukraińskie.</p>`,
          },
          {
            title: "6. Przechowywanie danych",
            content: `<p>Dane są przechowywane tak długo, jak jest to konieczne do celów określonych w niniejszej Polityce. Konta mogą zostać usunięte na żądanie, z wyjątkiem przypadków, gdy jesteśmy do tego prawnie zobowiązani. Zgłoszenia turniejowe i wyniki mogą być przechowywane w archiwach bez powiązania z danymi osobowymi.</p>`,
          },
          {
            title: "7. Twoje prawa",
            content: `<p>Masz prawo dostępu, poprawiania, usunięcia lub eksportu swoich danych osobowych; ograniczenia lub sprzeciwu wobec przetwarzania; oraz wycofania zgody. W celu skorzystania z tych praw skontaktuj się z nami pod adresem obriy168@gmail.com.</p>`,
          },
          {
            title: "8. Bezpieczeństwo",
            content: `<p>Wdrażamy szyfrowanie, kontrolę dostępu, regularne kopie zapasowe i monitorowanie zagrożeń w celu ochrony danych.</p>`,
          },
          {
            title: "9. Transfer międzynarodowy",
            content: `<p>Podczas korzystania z usług chmurowych dane mogą być przetwarzane poza Ukrainą. Zapewniamy odpowiednią ochronę poprzez standardowe klauzule umowne.</p>`,
          },
          {
            title: "10. Pliki cookie",
            content: `<p>Używamy plików cookie i podobnych technologii do utrzymywania sesji, zapamiętywania preferencji i analizowania interakcji z platformą.</p>`,
          },
          {
            title: "11. Rodzaje używanych plików cookie",
            type: "table",
            table: {
              headers: ["Typ", "Cel", "Przykłady"],
              rows: [
                [
                  "Niezbędne",
                  "Podstawowa funkcjonalność platformy",
                  "Uwierzytelnianie, sesje, tokeny CSRF, stan turnieju",
                ],
                [
                  "Funkcjonalne",
                  "Poprawa doświadczeń użytkownika",
                  "Preferencje językowe, ustawienia wyświetlania",
                ],
                [
                  "Analityczne",
                  "Zrozumienie korzystania z platformy",
                  "Google Analytics, analityka wewnętrzna (zanonimizowana)",
                ],
                [
                  "Preferencji",
                  "Zapamiętywanie wyborów",
                  "Zgoda na pliki cookie, filtry turniejów",
                ],
              ],
            },
          },
          {
            title: "12. Zarządzanie plikami cookie",
            content: `<p>Przy pierwszej wizycie wyświetlany jest baner zgody (z wyjątkiem niezbędnych plików cookie). Możesz zaakceptować wszystkie, odrzucić niepotrzebne lub dostosować swój wybór. Ustawienia można zmienić w dowolnym momencie za pomocą ustawień przeglądarki lub linku do ustawień plików cookie w stopce.</p>`,
          },
          {
            title: "13. Pliki cookie stron trzecich",
            content: `<p>Możemy korzystać z usług stron trzecich (np. hostingu wideo, analityki). Usługi te mogą ustawiać własne pliki cookie zgodnie ze swoimi zasadami.</p>`,
          },
          {
            title: "14. Okres przechowywania plików cookie",
            content: `<p>Sesyjne pliki cookie są usuwane po zamknięciu przeglądarki. Stałe pliki cookie pozostają od kilku dni do 1 roku w zależności od ich przeznaczenia.</p>`,
          },
          {
            title: "15. Zmiany",
            content: `<p>Możemy aktualizować niniejszą Politykę w dowolnym momencie. Zmiany będą publikowane na tej stronie z nową datą wejścia w życie. Dalsze korzystanie oznacza akceptację zmian.</p>`,
          },
          {
            title: "16. Kontakt",
            content: `<p>W razie pytań: <strong>obriy168@gmail.com</strong></p>`,
          },
        ],
      },
      termsPage: {
        title: "Warunki korzystania z usługi",
        effectiveDate: "Data wejścia w życie: 6 maja 2026 r.",
        lastUpdated: "Ostatnia aktualizacja: 6 maja 2026 r.",
        sections: [
          {
            title: "1. Postanowienia ogólne",
            content: `<p>1.1. Niniejsze Warunki regulują korzystanie z platformy turniejów programistycznych („Platforma”).</p><p>1.2. Korzystając z Platformy, zgadzasz się na niniejsze Warunki oraz Politykę prywatności i plików cookie.</p><p>1.3. Platforma nie narzuca ścisłych ograniczeń wiekowych w dostępie. Uczestnicy są jednak zobowiązani do powstrzymania się od publikowania materiałów, które mogą być uznane za nieodpowiednie, obraźliwe lub naruszające prawa osób trzecich.</p>`,
          },
          {
            title: "2. Własność konta i wyłączenie odpowiedzialności",
            content: `<p><strong>2.1. Własność konta.</strong> Twoje konto nie jest Twoją własnością. Platforma udziela Ci ograniczonej, odwołalnej licencji na korzystanie z konta. Zastrzegamy sobie prawo do zawieszenia, ograniczenia lub zamknięcia dowolnego konta według własnego uznania, z powiadomieniem lub bez niego.</p><p><strong>2.2. Utrata danych.</strong> Platforma jest dostarczana „tak jak jest”. Nie gwarantujemy integralności, dostępności ani trwałości danych. Jeśli baza danych ulegnie awarii, dane zostaną utracone lub Twoje konto stanie się niedostępne z jakiegokolwiek powodu, Platforma i jej operatorzy <strong>nie ponoszą odpowiedzialności</strong>. To Ty ponosisz pełną odpowiedzialność za tworzenie kopii zapasowych wszelkich przesyłanych treści.</p><p><strong>2.3. Brak gwarancji.</strong> Platforma jest dostarczana bez żadnych gwarancji, wyraźnych ani dorozumianych, w tym między innymi gwarancji przydatności handlowej, przydatności do określonego celu lub nienaruszania praw.</p>`,
          },
          {
            title: "3. Role użytkowników i konta",
            content: `<p><strong>3.1. Typy użytkowników:</strong></p><p><strong>Administrator/Organizator</strong> — tworzy i zarządza turniejami, rundami, zadaniami oraz przydziela prace jury.</p><p><strong>Zespół (Uczestnik)</strong> — rejestruje zespół i przesyła rozwiązania w ramach turniejów.</p><p><strong>Jury</strong> — ocenia prace zgodnie z ustalonymi kryteriami.</p><p><strong>3.2. Rejestracja:</strong> Zgadzasz się podawać dokładne i aktualne informacje. Zabronione są wielokrotne konta lub powtarzające się rejestracje (ten sam kapitan lub zestaw e-maili). Jesteś odpowiedzialny za zachowanie poufności swoich danych logowania.</p>`,
          },
          {
            title: "4. Zasady turniejów",
            content: `<p><strong>4.1. Rejestracja zespołów:</strong> Dostępna tylko w oknie czasowym ustalonym przez administratora. Minimalny rozmiar zespołu: 2 członków (chyba że określono inaczej). Po zamknięciu rejestracji zmiany w składzie zespołu są zabronione bez zgody administratora.</p><p><strong>4.2. Zgłoszenia:</strong> Zespoły muszą podać link do repozytorium GitHub oraz prezentację wideo. Edycja zgłoszeń jest dozwolona do terminu zakończenia rundy. Po terminie zgłoszenia są blokowane (status SubmissionClosed). Zespoły ponoszą odpowiedzialność za funkcjonalność podanych linków.</p><p><strong>4.3. Ocena:</strong> Jury ocenia prace obiektywnie według kryteriów określonych przez administratora. Każda praca jest oceniana przez co najmniej minimalną liczbę członków jury ustaloną przez administratora. Ocenianie własnej pracy lub pracy swojego zespołu jest surowo zabronione.</p>`,
          },
          {
            title: "5. Własność intelektualna",
            content: `<p><strong>5.1. Zawartość Platformy:</strong> Projekt, kod, logo i struktura Platformy należą do jej właścicieli. Kopiowanie, modyfikowanie lub rozpowszechnianie bez zgody jest zabronione.</p><p><strong>5.2. Treści użytkownika:</strong> Zgłoszenia (kod, filmy, opisy) pozostają własnością zespołu. Przesyłając zgłoszenie, udzielasz Platformie licencji na przechowywanie, wyświetlanie jury i publikację wyników. Administrator może umieszczać zgłoszenia w archiwum zakończonych turniejów.</p>`,
          },
          {
            title: "6. Moderacja treści i odpowiedzialność użytkowników",
            content: `<p><strong>6.1. Treści generowane przez użytkowników.</strong> Wszelkie treści przesyłane, publikowane lub udostępniane przez użytkowników (w tym rozwiązania, komentarze, opisy zespołów i linki) są <strong>wyłączną odpowiedzialnością</strong> użytkownika, który je opublikował. Platforma działa jako pasywny pośrednik i nie sprawdza wstępnie wszystkich treści użytkowników.</p><p><strong>6.2. Działania moderacyjne.</strong> Administracja dokłada starań, aby utrzymać bezpieczne środowisko i stosuje narzędzia programowe do filtrowania i moderowania przesyłanych treści (w tym filtry wulgaryzmów). Jednak istnienie takich narzędzi <strong>nie zwalnia użytkownika z odpowiedzialności</strong> za treść jego materiałów i ich zgodność z normami etycznymi oraz obowiązującym prawem.</p><p><strong>6.3. Brak poparcia ani gwarancji.</strong> Organizator nie gwarantuje dokładności, kompletności ani bezpieczeństwa treści publikowanych przez innych uczestników i <strong>nie ponosi odpowiedzialności za jakiekolwiek konsekwencje</strong> wynikające z ich używania. Platforma nie popiera, nie weryfikuje ani nie bierze odpowiedzialności za treści generowane przez użytkowników, w tym repozytoria kodu, demonstracje wideo lub linki zewnętrzne.</p>`,
          },
          {
            title: "7. Zachowania zabronione",
            content: `<p>Hakowanie, próby nieautoryzowanego dostępu, ataki DDoS, plagiat, przedstawianie cudzej pracy jako własnej, manipulacja wynikami, przekupstwo jury, rozpowszechnianie złośliwego oprogramowania poprzez zgłoszenia, dyskryminacja, nękanie, obrażanie innych uczestników, automatyczne zbieranie danych (skrobanie) bez zgody oraz publikowanie treści nielegalnych, zniesławiających, obscenicznych lub naruszających prawa osób trzecich.</p>`,
          },
          {
            title: "8. Egzekwowanie i sankcje",
            content: `<p>Administrator może zdyskwalifikować zespoły za naruszenia. W przypadku oszustwa wyniki mogą zostać unieważnione. Konta mogą zostać zawieszone za poważne naruszenia. Decyzje administratora dotyczące poszczególnych turniejów są ostateczne.</p>`,
          },
          {
            title: "9. Rozwiązanie i zmiany",
            content: `<p>Możemy zmieniać niniejsze Warunki z powiadomieniem użytkowników. Możesz usunąć swoje konto w dowolnym momencie. Zastrzegamy sobie prawo do zawieszenia lub zaprzestania świadczenia Platformy z powiadomieniem.</p>`,
          },
          {
            title: "10. Prawo właściwe i rozstrzyganie sporów",
            content: `<p>Niniejsze Warunki podlegają prawu <strong>Ukrainy</strong>. Spory będą rozstrzygane w drodze negocjacji; jeśli to niemożliwe, przed właściwymi sądami Ukrainy.</p>`,
          },
          {
            title: "11. Informacje kontaktowe",
            content: `<p>W razie pytań: <strong>obriy168@gmail.com</strong></p>`,
          },
        ],
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;