import type { MysteryData } from '../types/mystery';

/**
 * Fallback mystery collection.
 * These are used when the AI generation API is unavailable.
 * The sample mystery ("The Phantom Transaction") is in sampleMystery.ts.
 * This file provides additional mysteries for variety.
 */

export const FALLBACK_MYSTERIES: MysteryData[] = [
  {
    title: 'The Insider Leak',
    briefing:
      'Confidential product plans were leaked to a competitor just days before launch. ' +
      'The leak came from inside the company — someone accessed the classified documents ' +
      'and forwarded them externally. Find the mole.',
    difficulty: 'intermediate',

    tables: [
      {
        name: 'employees',
        description: 'Company staff directory',
        ddl: `CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  role TEXT NOT NULL,
  clearance_level INTEGER NOT NULL,
  hire_date TEXT NOT NULL
);`,
        inserts: [
          `INSERT INTO employees VALUES (1, 'Maria Santos', 'Product', 'VP Product', 3, '2019-04-01');`,
          `INSERT INTO employees VALUES (2, 'James Chen', 'Engineering', 'Senior Dev', 2, '2020-01-15');`,
          `INSERT INTO employees VALUES (3, 'Priya Sharma', 'Marketing', 'Marketing Lead', 2, '2021-03-22');`,
          `INSERT INTO employees VALUES (4, 'Tom Wilson', 'Product', 'Product Manager', 3, '2018-07-10');`,
          `INSERT INTO employees VALUES (5, 'Lisa Park', 'Engineering', 'Junior Dev', 1, '2023-06-01');`,
          `INSERT INTO employees VALUES (6, 'Alex Rivera', 'IT', 'Security Analyst', 3, '2020-11-01');`,
          `INSERT INTO employees VALUES (7, 'Nina Volkov', 'Sales', 'Account Executive', 1, '2022-02-14');`,
          `INSERT INTO employees VALUES (8, 'Derek Obi', 'Product', 'Designer', 2, '2021-09-30');`,
        ],
      },
      {
        name: 'documents',
        description: 'Classified documents and their access levels',
        ddl: `CREATE TABLE documents (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  classification TEXT NOT NULL,
  min_clearance INTEGER NOT NULL,
  created_by INTEGER NOT NULL,
  created_date TEXT NOT NULL
);`,
        inserts: [
          `INSERT INTO documents VALUES (1, 'Project Phoenix - Launch Plan', 'TOP SECRET', 3, 1, '2025-09-01');`,
          `INSERT INTO documents VALUES (2, 'Q4 Marketing Strategy', 'INTERNAL', 1, 3, '2025-09-15');`,
          `INSERT INTO documents VALUES (3, 'Phoenix Technical Architecture', 'SECRET', 2, 2, '2025-09-10');`,
          `INSERT INTO documents VALUES (4, 'Phoenix Pricing Model', 'TOP SECRET', 3, 4, '2025-09-20');`,
          `INSERT INTO documents VALUES (5, 'Employee Handbook', 'PUBLIC', 0, 6, '2025-01-01');`,
          `INSERT INTO documents VALUES (6, 'Phoenix Competitor Analysis', 'SECRET', 2, 1, '2025-09-25');`,
        ],
      },
      {
        name: 'access_log',
        description: 'Document access audit trail',
        ddl: `CREATE TABLE access_log (
  id INTEGER PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  document_id INTEGER NOT NULL,
  access_time TEXT NOT NULL,
  action TEXT NOT NULL,
  device TEXT NOT NULL
);`,
        inserts: [
          `INSERT INTO access_log VALUES (1, 1, 1, '2025-10-01 09:00:00', 'VIEW', 'LAPTOP-CORP');`,
          `INSERT INTO access_log VALUES (2, 4, 1, '2025-10-01 10:30:00', 'VIEW', 'LAPTOP-CORP');`,
          `INSERT INTO access_log VALUES (3, 4, 4, '2025-10-02 14:00:00', 'VIEW', 'LAPTOP-CORP');`,
          `INSERT INTO access_log VALUES (4, 4, 1, '2025-10-03 23:15:00', 'DOWNLOAD', 'PHONE-PERSONAL');`,
          `INSERT INTO access_log VALUES (5, 4, 4, '2025-10-03 23:18:00', 'DOWNLOAD', 'PHONE-PERSONAL');`,
          `INSERT INTO access_log VALUES (6, 4, 6, '2025-10-03 23:22:00', 'DOWNLOAD', 'PHONE-PERSONAL');`,
          `INSERT INTO access_log VALUES (7, 2, 3, '2025-10-04 08:00:00', 'VIEW', 'LAPTOP-CORP');`,
          `INSERT INTO access_log VALUES (8, 3, 2, '2025-10-04 09:30:00', 'VIEW', 'LAPTOP-CORP');`,
          `INSERT INTO access_log VALUES (9, 6, 1, '2025-10-05 11:00:00', 'VIEW', 'LAPTOP-CORP');`,
          `INSERT INTO access_log VALUES (10, 1, 6, '2025-10-05 14:00:00', 'VIEW', 'LAPTOP-CORP');`,
          `INSERT INTO access_log VALUES (11, 8, 3, '2025-10-06 10:00:00', 'VIEW', 'LAPTOP-CORP');`,
          `INSERT INTO access_log VALUES (12, 5, 5, '2025-10-06 12:00:00', 'VIEW', 'LAPTOP-CORP');`,
        ],
      },
      {
        name: 'email_log',
        description: 'External email activity from company accounts',
        ddl: `CREATE TABLE email_log (
  id INTEGER PRIMARY KEY,
  sender_id INTEGER NOT NULL,
  recipient_domain TEXT NOT NULL,
  subject TEXT NOT NULL,
  has_attachment INTEGER NOT NULL,
  sent_time TEXT NOT NULL,
  size_kb INTEGER NOT NULL
);`,
        inserts: [
          `INSERT INTO email_log VALUES (1, 3, 'gmail.com', 'Dinner plans', 0, '2025-10-01 18:00:00', 5);`,
          `INSERT INTO email_log VALUES (2, 4, 'rivalcorp.com', 'Re: Opportunity', 1, '2025-10-04 00:05:00', 4200);`,
          `INSERT INTO email_log VALUES (3, 7, 'client.com', 'Q4 Proposal', 1, '2025-10-04 09:00:00', 350);`,
          `INSERT INTO email_log VALUES (4, 2, 'github.com', 'PR Review', 0, '2025-10-04 11:00:00', 12);`,
          `INSERT INTO email_log VALUES (5, 4, 'rivalcorp.com', 'Follow-up', 1, '2025-10-04 00:12:00', 3800);`,
          `INSERT INTO email_log VALUES (6, 1, 'board.com', 'Monthly Update', 1, '2025-10-05 09:00:00', 180);`,
          `INSERT INTO email_log VALUES (7, 4, 'protonmail.com', 'Personal', 0, '2025-10-05 22:00:00', 8);`,
        ],
      },
    ],

    clues: [
      {
        id: 1,
        order: 1,
        narrative:
          'The leaked documents were all related to Project Phoenix. ' +
          'Start by finding which documents are classified as SECRET or TOP SECRET.',
        hint: 'Query the documents table filtering by classification level.',
        stronger_hint:
          "Try: SELECT * FROM documents WHERE classification IN ('SECRET', 'TOP SECRET')",
        validation: {
          type: 'contains_rows',
          required_values: [
            { column: 'title', value: 'Project Phoenix - Launch Plan' },
          ],
          min_rows: 3,
          max_rows: 5,
        },
        reveal_text:
          'Three Project Phoenix documents were classified: the Launch Plan, Pricing Model, and Competitor Analysis.',
        evidence_summary: '3 classified Phoenix documents identified',
        timeline_entry: 'Identified classified Phoenix documents',
      },
      {
        id: 2,
        order: 2,
        narrative:
          'Someone downloaded those documents. Check the access log for any DOWNLOAD actions on classified docs.',
        hint: 'Join access_log with documents and filter for DOWNLOAD actions.',
        stronger_hint:
          "Try: SELECT e.name, d.title, a.access_time, a.device FROM access_log a JOIN employees e ON a.employee_id = e.id JOIN documents d ON a.document_id = d.id WHERE a.action = 'DOWNLOAD'",
        validation: {
          type: 'contains_rows',
          required_values: [
            { column: 'name', value: 'Tom Wilson' },
            { column: 'action', value: 'DOWNLOAD' },
          ],
        },
        reveal_text:
          'Tom Wilson downloaded all three classified Phoenix documents at 11 PM from a personal phone — highly suspicious.',
        evidence_summary: 'Tom Wilson downloaded 3 docs from personal phone',
        timeline_entry: 'Oct 3, 11PM: Tom downloaded classified docs',
        connects_to_clue: 1,
      },
      {
        id: 3,
        order: 3,
        narrative:
          'After the downloads, check if any emails were sent to external domains with large attachments.',
        hint: 'Query email_log for emails with attachments sent around the same time as the downloads.',
        stronger_hint:
          "Try: SELECT e.name, el.recipient_domain, el.subject, el.size_kb, el.sent_time FROM email_log el JOIN employees e ON el.sender_id = e.id WHERE el.has_attachment = 1 AND el.size_kb > 1000",
        validation: {
          type: 'contains_rows',
          required_values: [
            { column: 'recipient_domain', value: 'rivalcorp.com' },
          ],
        },
        reveal_text:
          'Tom Wilson sent two large emails to rivalcorp.com minutes after downloading the files. The attachments were over 4MB — matching the document sizes.',
        evidence_summary: 'Emails with 4MB+ attachments sent to rivalcorp.com',
        timeline_entry: 'Oct 4, 12AM: Large emails sent to rival',
        connects_to_clue: 2,
      },
      {
        id: 4,
        order: 4,
        narrative:
          'Confirm the timeline: show that Tom accessed and emailed the documents the same night, and verify his clearance level allowed it.',
        hint: 'Compare Tom\'s clearance level with the documents\' minimum clearance requirements.',
        stronger_hint:
          "Try: SELECT e.name, e.clearance_level, d.title, d.min_clearance FROM employees e JOIN access_log a ON e.id = a.employee_id JOIN documents d ON a.document_id = d.id WHERE e.name = 'Tom Wilson' AND a.action = 'DOWNLOAD'",
        validation: {
          type: 'contains_rows',
          required_values: [
            { column: 'name', value: 'Tom Wilson' },
            { column: 'clearance_level', value: 3 },
          ],
          required_columns: ['clearance_level', 'min_clearance'],
        },
        reveal_text:
          'Tom Wilson had Level 3 clearance — enough to access everything. He used his legitimate access to steal the documents and send them to a competitor. Case closed.',
        evidence_summary: 'Level 3 clearance gave Tom access to all docs',
        timeline_entry: 'Motive confirmed: insider with full clearance',
        connects_to_clue: 3,
      },
    ],

    solution: {
      culprit: 'Tom Wilson',
      motive:
        'Corporate espionage — Tom Wilson, a Product Manager with top-level clearance, downloaded classified Project Phoenix documents late at night using a personal phone, then emailed them to RivalCorp.',
      final_narrative:
        'Tom Wilson exploited his Level 3 clearance to download all Project Phoenix documents from a personal device at 11 PM, ' +
        'then forwarded them to RivalCorp via email within minutes. The evidence trail is clear: access logs, download records, ' +
        'and email attachments all point to a deliberate act of corporate espionage. Excellent work, Detective.',
    },
  },
];

/**
 * Pick a random fallback mystery (excluding the main sample).
 */
export function getRandomFallbackMystery(): MysteryData {
  const idx = Math.floor(Math.random() * FALLBACK_MYSTERIES.length);
  return FALLBACK_MYSTERIES[idx];
}
