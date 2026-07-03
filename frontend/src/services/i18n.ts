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
        autoLoginFailed:
          "Account created, but automatic login failed. Please log in manually.",
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
        autoLoginFailed:
          "Аккаунт создан, но автоматический вход не удался. Пожалуйста, войдите вручную.",
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
        autoLoginFailed:
          "Konto zostało utworzone, ale automatyczne logowanie nie powiodło się. Zaloguj się ręcznie.",
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