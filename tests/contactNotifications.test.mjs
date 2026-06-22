import assert from "node:assert/strict";
import test from "node:test";

async function loadContactNotifications() {
  try {
    return await import("../lib/email/contactNotifications.ts");
  } catch {
    return null;
  }
}

test("builds a safe admin alert without the contact message body", async () => {
  const api = await loadContactNotifications();
  assert.ok(api, "contact notification module should exist");

  const email = api.buildContactNotificationEmail({
    name: 'Jan <script>alert("x")</script>\r\nBcc: victim@example.com',
    companyName: "Firma & Partnerzy",
    topic: "Oferta <pilna>",
    source: "contact:administracja",
    createdAt: new Date("2026-06-22T10:00:00.000Z"),
    appBaseUrl: "https://www.wolnemoce.com/",
    message: "TA_TRESC_NIE_MOZE_TRAFIL_DO_MAILA",
  });

  assert.equal(
    email.subject,
    "WolneMoce — nowa wiadomość z formularza kontaktowego"
  );
  assert.match(email.html, /Jan &lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt; Bcc:/);
  assert.match(email.html, /Firma &amp; Partnerzy/);
  assert.match(email.html, /Oferta &lt;pilna&gt;/);
  assert.doesNotMatch(email.html, /<script>|\r|\nBcc:/);
  assert.doesNotMatch(email.html, /TA_TRESC_NIE_MOZE_TRAFIL_DO_MAILA/);
  assert.doesNotMatch(email.text, /TA_TRESC_NIE_MOZE_TRAFIL_DO_MAILA/);
  assert.match(
    email.html,
    /https:\/\/www\.wolnemoce\.com\/admin\/contact-messages/
  );
});

test("does nothing when contact notifications are disabled", async () => {
  const api = await loadContactNotifications();
  assert.ok(api, "contact notification module should exist");
  let sendCount = 0;
  let logCount = 0;

  const result = await api.sendContactNotification(
    {
      name: "Jan Kowalski",
      companyName: null,
      topic: null,
      source: "contact",
      createdAt: new Date("2026-06-22T10:00:00.000Z"),
    },
    {
      env: {
        CONTACT_EMAIL_NOTIFICATIONS_ENABLED: "false",
        CONTACT_EMAIL_LOG_ONLY: "true",
      },
      sendMail: async () => {
        sendCount += 1;
      },
      log: () => {
        logCount += 1;
      },
    }
  );

  assert.equal(result, "disabled");
  assert.equal(sendCount, 0);
  assert.equal(logCount, 0);
});

test("LOG_ONLY records only minimal technical metadata and never sends", async () => {
  const api = await loadContactNotifications();
  assert.ok(api, "contact notification module should exist");
  let sendCount = 0;
  const logs = [];

  const result = await api.sendContactNotification(
    {
      name: "Dane prywatne",
      companyName: "Firma prywatna",
      topic: "Temat prywatny",
      source: "contact:credos",
      createdAt: new Date("2026-06-22T10:00:00.000Z"),
    },
    {
      env: {
        CONTACT_EMAIL_NOTIFICATIONS_ENABLED: "true",
        CONTACT_EMAIL_LOG_ONLY: "true",
      },
      sendMail: async () => {
        sendCount += 1;
      },
      log: (event) => logs.push(event),
    }
  );

  assert.equal(result, "log_only");
  assert.equal(sendCount, 0);
  assert.deepEqual(logs, [
    {
      event: "contact_email_notification_log_only",
      timestamp: "2026-06-22T10:00:00.000Z",
      source: "contact:credos",
      wouldSend: true,
    },
  ]);
});

test("awaits the SMTP sender when notifications are enabled", async () => {
  const api = await loadContactNotifications();
  assert.ok(api, "contact notification module should exist");
  const calls = [];

  const result = await api.sendContactNotification(
    {
      name: "Jan Kowalski",
      companyName: null,
      topic: "Współpraca",
      source: "contact",
      createdAt: new Date("2026-06-22T10:00:00.000Z"),
    },
    {
      env: {
        CONTACT_EMAIL_NOTIFICATIONS_ENABLED: "true",
        CONTACT_EMAIL_LOG_ONLY: "false",
        CONTACT_EMAIL_TO: "kontakt@wolnemoce.com",
        APP_BASE_URL: "https://www.wolnemoce.com",
      },
      sendMail: async (message) => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        calls.push(message);
      },
      log: () => assert.fail("send mode must not emit a LOG_ONLY event"),
    }
  );

  assert.equal(result, "sent");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].to, "kontakt@wolnemoce.com");
});

test("creates the SMTP transporter lazily and reuses the singleton", async () => {
  const envNames = [
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_SECURE",
    "SMTP_USER",
    "SMTP_PASSWORD",
  ];
  const previousEnv = Object.fromEntries(
    envNames.map((name) => [name, process.env[name]])
  );

  for (const name of envNames) {
    delete process.env[name];
  }

  const smtp = await import("../lib/email/smtpClient.ts");

  Object.assign(process.env, {
    SMTP_HOST: "mail.example.test",
    SMTP_PORT: "465",
    SMTP_SECURE: "true",
    SMTP_USER: "kontakt@example.test",
    SMTP_PASSWORD: "test-only-password",
  });

  const first = smtp.getSmtpTransporter();
  const second = smtp.getSmtpTransporter();
  assert.strictEqual(first, second);

  for (const name of envNames) {
    if (previousEnv[name] === undefined) {
      delete process.env[name];
    } else {
      process.env[name] = previousEnv[name];
    }
  }
});
