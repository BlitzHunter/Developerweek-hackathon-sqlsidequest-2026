import type { MysteryData } from '../types/mystery';

/**
 * Sample mystery for testing Day 2 components.
 * "The Phantom Transaction" - A beginner-level case about embezzlement.
 */
export const SAMPLE_MYSTERY: MysteryData = {
  title: 'The Phantom Transaction',
  briefing:
    'A routine audit at Meridian Corp has uncovered $250,000 in suspicious transfers. ' +
    'The money was moved through a web of internal accounts over the past six months. ' +
    'Someone on the inside is siphoning funds — and covering their tracks. ' +
    'Use SQL to interrogate the database, follow the money, and unmask the culprit.',
  difficulty: 'beginner',

  tables: [
    {
      name: 'employees',
      description: 'All Meridian Corp employees and their departments',
      location: 'OFFICE',
      ddl: `CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  role TEXT NOT NULL,
  hire_date TEXT NOT NULL,
  salary INTEGER NOT NULL,
  manager_id INTEGER,
  email TEXT NOT NULL
);`,
      inserts: [
        `INSERT INTO employees VALUES (1, 'Alice Nguyen', 'Finance', 'CFO', '2018-03-15', 145000, NULL, 'alice.nguyen@meridian.com');`,
        `INSERT INTO employees VALUES (2, 'Bob Martinez', 'Finance', 'Accountant', '2019-07-22', 72000, 1, 'bob.martinez@meridian.com');`,
        `INSERT INTO employees VALUES (3, 'Carol Zhang', 'Engineering', 'VP Engineering', '2017-01-10', 155000, NULL, 'carol.zhang@meridian.com');`,
        `INSERT INTO employees VALUES (4, 'David Kim', 'Engineering', 'Developer', '2020-06-01', 95000, 3, 'david.kim@meridian.com');`,
        `INSERT INTO employees VALUES (5, 'Elena Rossi', 'Finance', 'Analyst', '2021-02-14', 68000, 1, 'elena.rossi@meridian.com');`,
        `INSERT INTO employees VALUES (6, 'Frank Okafor', 'Operations', 'COO', '2016-11-30', 150000, NULL, 'frank.okafor@meridian.com');`,
        `INSERT INTO employees VALUES (7, 'Grace Liu', 'IT', 'Sysadmin', '2019-09-01', 88000, 6, 'grace.liu@meridian.com');`,
        `INSERT INTO employees VALUES (8, 'Henry Patel', 'Finance', 'Auditor', '2022-01-18', 70000, 1, 'henry.patel@meridian.com');`,
      ],
    },
    {
      name: 'transactions',
      description: 'Financial transactions processed through Meridian Corp',
      location: 'CITY_BANK',
      ddl: `CREATE TABLE transactions (
  id INTEGER PRIMARY KEY,
  date TEXT NOT NULL,
  from_account TEXT NOT NULL,
  to_account TEXT NOT NULL,
  amount REAL NOT NULL,
  approved_by INTEGER NOT NULL,
  description TEXT,
  FOREIGN KEY (approved_by) REFERENCES employees(id)
);`,
      inserts: [
        `INSERT INTO transactions VALUES (101, '2025-08-12', 'OPERATIONS-001', 'VENDOR-A', 12000.00, 6, 'Office supplies Q3');`,
        `INSERT INTO transactions VALUES (102, '2025-08-15', 'FINANCE-MAIN', 'SHELL-7721', 45000.00, 2, 'Consulting fee');`,
        `INSERT INTO transactions VALUES (103, '2025-09-01', 'PAYROLL', 'EMP-BONUS', 8500.00, 1, 'Q3 bonus pool');`,
        `INSERT INTO transactions VALUES (104, '2025-09-10', 'FINANCE-MAIN', 'SHELL-7721', 52000.00, 2, 'Infrastructure upgrade');`,
        `INSERT INTO transactions VALUES (105, '2025-09-22', 'OPERATIONS-001', 'VENDOR-B', 3200.00, 6, 'Catering services');`,
        `INSERT INTO transactions VALUES (106, '2025-10-05', 'FINANCE-RESERVE', 'SHELL-7721', 63000.00, 2, 'Year-end audit prep');`,
        `INSERT INTO transactions VALUES (107, '2025-10-15', 'PAYROLL', 'EMP-SALARY', 285000.00, 1, 'October payroll');`,
        `INSERT INTO transactions VALUES (108, '2025-10-20', 'FINANCE-MAIN', 'VENDOR-C', 18000.00, 1, 'Legal retainer');`,
        `INSERT INTO transactions VALUES (109, '2025-11-02', 'FINANCE-RESERVE', 'SHELL-7721', 48000.00, 2, 'Data migration project');`,
        `INSERT INTO transactions VALUES (110, '2025-11-18', 'OPERATIONS-001', 'VENDOR-A', 9500.00, 6, 'Office supplies Q4');`,
        `INSERT INTO transactions VALUES (111, '2025-12-01', 'FINANCE-MAIN', 'SHELL-7721', 42000.00, 2, 'Security audit');`,
        `INSERT INTO transactions VALUES (112, '2025-12-10', 'PAYROLL', 'EMP-SALARY', 285000.00, 1, 'November payroll');`,
      ],
    },
    {
      name: 'access_logs',
      description: 'System access logs showing who logged in and when',
      location: 'POLICE',
      ddl: `CREATE TABLE access_logs (
  id INTEGER PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  timestamp TEXT NOT NULL,
  system TEXT NOT NULL,
  action TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);`,
      inserts: [
        `INSERT INTO access_logs VALUES (1001, 2, '2025-08-15 02:47:00', 'FINANCE_PORTAL', 'TRANSFER_APPROVED', '10.0.1.55');`,
        `INSERT INTO access_logs VALUES (1002, 1, '2025-08-15 09:15:00', 'FINANCE_PORTAL', 'LOGIN', '10.0.1.10');`,
        `INSERT INTO access_logs VALUES (1003, 2, '2025-09-10 03:12:00', 'FINANCE_PORTAL', 'TRANSFER_APPROVED', '10.0.1.55');`,
        `INSERT INTO access_logs VALUES (1004, 7, '2025-09-10 03:15:00', 'ADMIN_CONSOLE', 'LOG_DELETED', '10.0.1.55');`,
        `INSERT INTO access_logs VALUES (1005, 2, '2025-10-05 01:33:00', 'FINANCE_PORTAL', 'TRANSFER_APPROVED', '10.0.1.55');`,
        `INSERT INTO access_logs VALUES (1006, 5, '2025-10-05 09:00:00', 'FINANCE_PORTAL', 'LOGIN', '10.0.1.22');`,
        `INSERT INTO access_logs VALUES (1007, 7, '2025-10-05 01:35:00', 'ADMIN_CONSOLE', 'LOG_DELETED', '10.0.1.55');`,
        `INSERT INTO access_logs VALUES (1008, 2, '2025-11-02 02:05:00', 'FINANCE_PORTAL', 'TRANSFER_APPROVED', '10.0.1.55');`,
        `INSERT INTO access_logs VALUES (1009, 2, '2025-12-01 02:22:00', 'FINANCE_PORTAL', 'TRANSFER_APPROVED', '10.0.1.55');`,
        `INSERT INTO access_logs VALUES (1010, 7, '2025-12-01 02:25:00', 'ADMIN_CONSOLE', 'LOG_DELETED', '10.0.1.55');`,
        `INSERT INTO access_logs VALUES (1011, 8, '2025-12-02 10:00:00', 'FINANCE_PORTAL', 'AUDIT_FLAGGED', '10.0.1.30');`,
        `INSERT INTO access_logs VALUES (1012, 1, '2025-12-02 14:00:00', 'FINANCE_PORTAL', 'LOGIN', '10.0.1.10');`,
      ],
    },
    
    // ===== OFFICE (2 more tables) =====
    {
      name: 'departments',
      description: 'Company departments and their budgets',
      location: 'OFFICE',
      ddl: `CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  budget INTEGER NOT NULL,
  manager_id INTEGER,
  floor INTEGER NOT NULL,
  FOREIGN KEY (manager_id) REFERENCES employees(id)
);`,
      inserts: [
        `INSERT INTO departments VALUES (1, 'Finance', 850000, 1, 5);`,
        `INSERT INTO departments VALUES (2, 'Engineering', 1200000, 3, 3);`,
        `INSERT INTO departments VALUES (3, 'Operations', 650000, 6, 2);`,
        `INSERT INTO departments VALUES (4, 'IT', 400000, NULL, 1);`,
      ],
    },
    {
      name: 'office_access',
      description: 'Building access card swipes and entry logs',
      location: 'OFFICE',
      ddl: `CREATE TABLE office_access (
  id INTEGER PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  timestamp TEXT NOT NULL,
  floor INTEGER NOT NULL,
  access_point TEXT NOT NULL,
  card_id TEXT NOT NULL,
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);`,
      inserts: [
        `INSERT INTO office_access VALUES (5001, 2, '2025-08-14 18:45:00', 5, 'FINANCE_DOOR', 'CARD-002');`,
        `INSERT INTO office_access VALUES (5002, 2, '2025-08-15 02:30:00', 5, 'FINANCE_DOOR', 'CARD-002');`,
        `INSERT INTO office_access VALUES (5003, 7, '2025-08-15 02:33:00', 1, 'SERVER_ROOM', 'CARD-007');`,
        `INSERT INTO office_access VALUES (5004, 2, '2025-09-10 02:55:00', 5, 'FINANCE_DOOR', 'CARD-002');`,
        `INSERT INTO office_access VALUES (5005, 7, '2025-09-10 03:10:00', 1, 'SERVER_ROOM', 'CARD-007');`,
        `INSERT INTO office_access VALUES (5006, 1, '2025-10-05 09:00:00', 5, 'EXECUTIVE_FLOOR', 'CARD-001');`,
        `INSERT INTO office_access VALUES (5007, 2, '2025-10-05 01:20:00', 5, 'FINANCE_DOOR', 'CARD-002');`,
        `INSERT INTO office_access VALUES (5008, 7, '2025-10-05 01:30:00', 1, 'SERVER_ROOM', 'CARD-007');`,
      ],
    },

    // ===== POLICE (2 more tables) =====
    {
      name: 'incident_reports',
      description: 'Police incident reports and investigations',
      location: 'POLICE',
      ddl: `CREATE TABLE incident_reports (
  id INTEGER PRIMARY KEY,
  report_date TEXT NOT NULL,
  report_type TEXT NOT NULL,
  location TEXT NOT NULL,
  officer_name TEXT NOT NULL,
  suspect_name TEXT,
  description TEXT NOT NULL
);`,
      inserts: [
        `INSERT INTO incident_reports VALUES (9001, '2025-11-15', 'SUSPICIOUS_ACTIVITY', 'Meridian Corp', 'Officer Chen', NULL, 'Anonymous tip about late-night activity at corporate offices');`,
        `INSERT INTO incident_reports VALUES (9002, '2025-12-01', 'FINANCIAL_CRIME', 'City Bank', 'Detective Rivera', NULL, 'Bank flagged unusual wire transfers to offshore accounts');`,
        `INSERT INTO incident_reports VALUES (9003, '2025-12-02', 'FRAUD_INVESTIGATION', 'Meridian Corp', 'Detective Rivera', 'Bob Martinez', 'Suspected embezzlement - case opened');`,
        `INSERT INTO incident_reports VALUES (9004, '2025-12-03', 'COMPUTER_CRIME', 'Meridian Corp', 'Detective Rivera', 'Grace Liu', 'Evidence tampering - deleted audit logs');`,
      ],
    },
    {
      name: 'evidence_log',
      description: 'Chain of custody for collected evidence',
      location: 'POLICE',
      ddl: `CREATE TABLE evidence_log (
  id INTEGER PRIMARY KEY,
  case_id INTEGER NOT NULL,
  evidence_type TEXT NOT NULL,
  description TEXT NOT NULL,
  collected_by TEXT NOT NULL,
  collected_date TEXT NOT NULL,
  location TEXT NOT NULL
);`,
      inserts: [
        `INSERT INTO evidence_log VALUES (7001, 9003, 'DIGITAL', 'Server access logs', 'Det. Rivera', '2025-12-02', 'Meridian Corp - IT Dept');`,
        `INSERT INTO evidence_log VALUES (7002, 9003, 'FINANCIAL', 'Transaction records', 'Det. Rivera', '2025-12-02', 'City Bank HQ');`,
        `INSERT INTO evidence_log VALUES (7003, 9003, 'DIGITAL', 'Deleted log files recovered', 'Det. Rivera', '2025-12-03', 'Meridian Corp - Server Room');`,
        `INSERT INTO evidence_log VALUES (7004, 9003, 'WITNESS', 'Statement from CFO Alice Nguyen', 'Det. Rivera', '2025-12-02', 'Police HQ');`,
      ],
    },

    // ===== HIGH RISE CONDO (3 tables) =====
    {
      name: 'residents',
      description: 'High-rise condo residents and unit information',
      location: 'HIGH_RISE_CONDO',
      ddl: `CREATE TABLE residents (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  unit_number TEXT NOT NULL,
  move_in_date TEXT NOT NULL,
  occupation TEXT,
  phone TEXT NOT NULL
);`,
      inserts: [
        `INSERT INTO residents VALUES (301, 'Bob Martinez', '27B', '2024-03-15', 'Accountant', '555-0142');`,
        `INSERT INTO residents VALUES (302, 'Sarah Chen', '27A', '2023-06-01', 'Doctor', '555-0198');`,
        `INSERT INTO residents VALUES (303, 'Marcus Johnson', '28C', '2024-01-10', 'Lawyer', '555-0223');`,
        `INSERT INTO residents VALUES (304, 'Grace Liu', '14F', '2023-11-20', 'IT Manager', '555-0187');`,
      ],
    },
    {
      name: 'visitor_logs',
      description: 'Front desk visitor check-in records',
      location: 'HIGH_RISE_CONDO',
      ddl: `CREATE TABLE visitor_logs (
  id INTEGER PRIMARY KEY,
  visit_date TEXT NOT NULL,
  visitor_name TEXT NOT NULL,
  resident_unit TEXT NOT NULL,
  check_in_time TEXT NOT NULL,
  check_out_time TEXT,
  purpose TEXT
);`,
      inserts: [
        `INSERT INTO visitor_logs VALUES (4001, '2025-08-14', 'Grace Liu', '27B', '22:15:00', '23:45:00', 'Personal visit');`,
        `INSERT INTO visitor_logs VALUES (4002, '2025-09-09', 'Grace Liu', '27B', '21:30:00', '23:00:00', 'Personal visit');`,
        `INSERT INTO visitor_logs VALUES (4003, '2025-10-04', 'Grace Liu', '27B', '20:45:00', '22:30:00', 'Personal visit');`,
        `INSERT INTO visitor_logs VALUES (4004, '2025-11-01', 'Grace Liu', '27B', '21:00:00', '23:15:00', 'Personal visit');`,
        `INSERT INTO visitor_logs VALUES (4005, '2025-11-30', 'Grace Liu', '27B', '20:30:00', NULL, 'Personal visit');`,
      ],
    },
    {
      name: 'security_footage',
      description: 'Security camera recording index',
      location: 'HIGH_RISE_CONDO',
      ddl: `CREATE TABLE security_footage (
  id INTEGER PRIMARY KEY,
  camera_location TEXT NOT NULL,
  recording_date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  flagged BOOLEAN DEFAULT 0
);`,
      inserts: [
        `INSERT INTO security_footage VALUES (8001, 'LOBBY_ENTRANCE', '2025-08-14', '22:00:00', 120, 0);`,
        `INSERT INTO security_footage VALUES (8002, 'FLOOR_27_HALLWAY', '2025-08-14', '22:00:00', 120, 1);`,
        `INSERT INTO security_footage VALUES (8003, 'LOBBY_ENTRANCE', '2025-09-09', '21:00:00', 150, 0);`,
        `INSERT INTO security_footage VALUES (8004, 'FLOOR_27_HALLWAY', '2025-09-09', '21:00:00', 150, 1);`,
      ],
    },

    // ===== DOWNTOWN BISTRO (3 tables) =====
    {
      name: 'reservations',
      description: 'Restaurant reservation records',
      location: 'DOWNTOWN_BISTRO',
      ddl: `CREATE TABLE reservations (
  id INTEGER PRIMARY KEY,
  reservation_date TEXT NOT NULL,
  reservation_time TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  party_size INTEGER NOT NULL,
  phone TEXT NOT NULL,
  special_requests TEXT
);`,
      inserts: [
        `INSERT INTO reservations VALUES (2001, '2025-08-14', '20:00:00', 'Bob Martinez', 2, '555-0142', 'Corner booth');`,
        `INSERT INTO reservations VALUES (2002, '2025-09-09', '19:30:00', 'Martinez', 2, '555-0142', 'Private table');`,
        `INSERT INTO reservations VALUES (2003, '2025-10-04', '19:00:00', 'B. Martinez', 2, '555-0142', 'Quiet area');`,
        `INSERT INTO reservations VALUES (2004, '2025-11-01', '20:30:00', 'Bob M.', 2, '555-0142', 'Window seat');`,
      ],
    },
    {
      name: 'orders',
      description: 'Food and beverage orders',
      location: 'DOWNTOWN_BISTRO',
      ddl: `CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  order_date TEXT NOT NULL,
  table_number INTEGER NOT NULL,
  guest_name TEXT,
  items TEXT NOT NULL,
  total_amount REAL NOT NULL,
  payment_method TEXT NOT NULL
);`,
      inserts: [
        `INSERT INTO orders VALUES (6001, '2025-08-14', 12, 'Bob Martinez', 'Steak, Wine x2, Dessert', 187.50, 'CASH');`,
        `INSERT INTO orders VALUES (6002, '2025-09-09', 8, 'Martinez', 'Pasta, Wine x2, Appetizer', 156.00, 'CASH');`,
        `INSERT INTO orders VALUES (6003, '2025-10-04', 15, 'B. Martinez', 'Salmon, Wine x2, Dessert', 198.75, 'CASH');`,
        `INSERT INTO orders VALUES (6004, '2025-11-01', 12, 'Bob M.', 'Ribeye, Wine x2, Appetizer', 210.00, 'CASH');`,
      ],
    },
    {
      name: 'staff_schedule',
      description: 'Restaurant staff work schedules',
      location: 'DOWNTOWN_BISTRO',
      ddl: `CREATE TABLE staff_schedule (
  id INTEGER PRIMARY KEY,
  employee_name TEXT NOT NULL,
  role TEXT NOT NULL,
  shift_date TEXT NOT NULL,
  shift_start TEXT NOT NULL,
  shift_end TEXT NOT NULL
);`,
      inserts: [
        `INSERT INTO staff_schedule VALUES (3001, 'Maria Santos', 'Server', '2025-08-14', '17:00:00', '23:00:00');`,
        `INSERT INTO staff_schedule VALUES (3002, 'James Park', 'Server', '2025-09-09', '17:00:00', '23:00:00');`,
        `INSERT INTO staff_schedule VALUES (3003, 'Maria Santos', 'Server', '2025-10-04', '17:00:00', '23:00:00');`,
        `INSERT INTO staff_schedule VALUES (3004, 'Elena Rodriguez', 'Hostess', '2025-11-01', '16:00:00', '22:00:00');`,
      ],
    },

    // ===== NIGHT BAR (3 tables) =====
    {
      name: 'bar_tabs',
      description: 'Bar customer tabs and purchases',
      location: 'NIGHT_BAR',
      ddl: `CREATE TABLE bar_tabs (
  id INTEGER PRIMARY KEY,
  tab_date TEXT NOT NULL,
  customer_name TEXT,
  open_time TEXT NOT NULL,
  close_time TEXT,
  total_amount REAL NOT NULL,
  payment_method TEXT
);`,
      inserts: [
        `INSERT INTO bar_tabs VALUES (1501, '2025-08-15', 'Bob M.', '00:15:00', '02:30:00', 127.50, 'CASH');`,
        `INSERT INTO bar_tabs VALUES (1502, '2025-09-10', 'Martinez', '00:45:00', '03:00:00', 145.00, 'CASH');`,
        `INSERT INTO bar_tabs VALUES (1503, '2025-10-06', NULL, '01:00:00', '02:45:00', 98.50, 'CASH');`,
        `INSERT INTO bar_tabs VALUES (1504, '2025-11-02', 'B.M.', '00:30:00', '03:15:00', 156.00, 'CASH');`,
      ],
    },
    {
      name: 'vip_members',
      description: 'VIP membership and loyalty program',
      location: 'NIGHT_BAR',
      ddl: `CREATE TABLE vip_members (
  id INTEGER PRIMARY KEY,
  member_name TEXT NOT NULL,
  membership_date TEXT NOT NULL,
  phone TEXT NOT NULL,
  total_visits INTEGER NOT NULL,
  referral_code TEXT
);`,
      inserts: [
        `INSERT INTO vip_members VALUES (801, 'Bob Martinez', '2025-07-01', '555-0142', 12, 'VIP-BOB-2025');`,
        `INSERT INTO vip_members VALUES (802, 'Grace Liu', '2025-07-15', '555-0187', 8, 'VIP-GRACE-2025');`,
        `INSERT INTO vip_members VALUES (803, 'David Kim', '2025-08-20', '555-0201', 5, 'VIP-DAVID-2025');`,
      ],
    },
    {
      name: 'surveillance_logs',
      description: 'Bar security camera and incident logs',
      location: 'NIGHT_BAR',
      ddl: `CREATE TABLE surveillance_logs (
  id INTEGER PRIMARY KEY,
  log_date TEXT NOT NULL,
  log_time TEXT NOT NULL,
  camera_id TEXT NOT NULL,
  incident_type TEXT NOT NULL,
  description TEXT,
  reviewed BOOLEAN DEFAULT 0
);`,
      inserts: [
        `INSERT INTO surveillance_logs VALUES (9501, '2025-08-15', '02:15:00', 'BAR-CAM-03', 'UNUSUAL_BEHAVIOR', 'Two patrons meeting in corner booth, exchanging envelope', 1);`,
        `INSERT INTO surveillance_logs VALUES (9502, '2025-09-10', '02:50:00', 'BAR-CAM-03', 'UNUSUAL_BEHAVIOR', 'Same patrons return, longer meeting', 1);`,
        `INSERT INTO surveillance_logs VALUES (9503, '2025-11-02', '03:00:00', 'BAR-CAM-03', 'UNUSUAL_BEHAVIOR', 'Regular late-night meeting observed again', 0);`,
      ],
    },

    // ===== CITY BANK (2 more tables) =====
    {
      name: 'accounts',
      description: 'Bank account information and balances',
      location: 'CITY_BANK',
      ddl: `CREATE TABLE accounts (
  id INTEGER PRIMARY KEY,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL,
  balance REAL NOT NULL,
  opened_date TEXT NOT NULL,
  status TEXT NOT NULL
);`,
      inserts: [
        `INSERT INTO accounts VALUES (401, 'FINANCE-MAIN', 'Meridian Corp - Main Operations', 'BUSINESS', 2450000.00, '2016-01-15', 'ACTIVE');`,
        `INSERT INTO accounts VALUES (402, 'SHELL-7721', 'Consulting Services LLC', 'BUSINESS', 250000.00, '2025-08-01', 'FLAGGED');`,
        `INSERT INTO accounts VALUES (403, 'OPERATIONS-001', 'Meridian Corp - Operations', 'BUSINESS', 850000.00, '2016-01-15', 'ACTIVE');`,
        `INSERT INTO accounts VALUES (404, 'PAYROLL', 'Meridian Corp - Payroll', 'BUSINESS', 450000.00, '2016-01-15', 'ACTIVE');`,
      ],
    },
    {
      name: 'wire_transfers',
      description: 'International and domestic wire transfer records',
      location: 'CITY_BANK',
      ddl: `CREATE TABLE wire_transfers (
  id INTEGER PRIMARY KEY,
  transfer_date TEXT NOT NULL,
  from_account TEXT NOT NULL,
  to_account TEXT NOT NULL,
  amount REAL NOT NULL,
  destination_country TEXT NOT NULL,
  swift_code TEXT,
  status TEXT NOT NULL
);`,
      inserts: [
        `INSERT INTO wire_transfers VALUES (2201, '2025-08-16', 'SHELL-7721', 'CAYMAN-9834', 45000.00, 'CAYMAN_ISLANDS', 'CIBC-KY-001', 'COMPLETED');`,
        `INSERT INTO wire_transfers VALUES (2202, '2025-09-12', 'SHELL-7721', 'CAYMAN-9834', 52000.00, 'CAYMAN_ISLANDS', 'CIBC-KY-001', 'COMPLETED');`,
        `INSERT INTO wire_transfers VALUES (2203, '2025-10-07', 'SHELL-7721', 'CAYMAN-9834', 63000.00, 'CAYMAN_ISLANDS', 'CIBC-KY-001', 'COMPLETED');`,
        `INSERT INTO wire_transfers VALUES (2204, '2025-11-04', 'SHELL-7721', 'CAYMAN-9834', 48000.00, 'CAYMAN_ISLANDS', 'CIBC-KY-001', 'COMPLETED');`,
        `INSERT INTO wire_transfers VALUES (2205, '2025-12-02', 'SHELL-7721', 'CAYMAN-9834', 42000.00, 'CAYMAN_ISLANDS', 'CIBC-KY-001', 'FLAGGED');`,
      ],
    },
  ],

  clues: [
    {
      id: 1,
      order: 1,
      narrative:
        'Security has flagged unusual building access patterns. ' +
        'Someone has been entering the finance floor during the middle of the night. ' +
        'Query the office_access table to find who accessed floor 5 between 1 AM and 3 AM.',
      hint: 'Use SELECT with a JOIN to employees, filter by floor 5 and timestamps between 01:00:00 and 03:00:00.',
      stronger_hint:
        'Try: SELECT e.name, e.role, o.timestamp, o.floor FROM office_access o JOIN employees e ON o.employee_id = e.id WHERE o.floor = 5 AND o.timestamp LIKE \'% 0[12]:%\' ORDER BY o.timestamp',
      validation: {
        type: 'contains_rows',
        required_values: [
          { column: 'name', value: 'Bob Martinez' },
          { column: 'floor', value: 5 },
        ],
        min_rows: 3,
      },
      reveal_text:
        'Bob Martinez, a junior accountant, has been swiping into the finance floor at 1-2 AM on multiple occasions. ' +
        'Why would an accountant need to work alone in the middle of the night?',
      evidence_summary: 'Bob Martinez: Late-night finance floor access',
      timeline_entry: 'Aug-Oct: Bob enters floor 5 between 1-3 AM',
    },
    {
      id: 2,
      order: 2,
      narrative:
        'Now that we have a suspect, let\'s check if the police already know about him. ' +
        'Search the incident_reports table for any reports mentioning "Bob Martinez" or "embezzlement".',
      hint: 'Query incident_reports and filter by suspect_name or look for financial crime reports.',
      stronger_hint:
        'Try: SELECT * FROM incident_reports WHERE suspect_name LIKE \'%Bob%\' OR report_type = \'FRAUD_INVESTIGATION\' ORDER BY report_date',
      validation: {
        type: 'contains_rows',
        required_values: [
          { column: 'suspect_name', value: 'Bob Martinez' },
          { column: 'report_type', value: 'FRAUD_INVESTIGATION' },
        ],
      },
      reveal_text:
        'Detective Rivera opened case #9003 on December 2nd — Bob Martinez is under investigation for suspected embezzlement. ' +
        'The police are already on his trail.',
      evidence_summary: 'Active fraud investigation: Case #9003',
      timeline_entry: 'Dec 2: Detective Rivera opens fraud case on Bob',
      connects_to_clue: 1,
    },
    {
      id: 3,
      order: 3,
      narrative:
        'Follow the money. The bank has records of all transactions. ' +
        'Find all transactions sent to account "SHELL-7721" and check where the money went using wire_transfers.',
      hint: 'Query transactions for to_account = \'SHELL-7721\', then JOIN with wire_transfers to see the final destination.',
      stronger_hint:
        'Try: SELECT t.date, t.amount, t.description, w.destination_country, w.to_account FROM transactions t LEFT JOIN wire_transfers w ON t.to_account = w.from_account WHERE t.to_account = \'SHELL-7721\' ORDER BY t.date',
      validation: {
        type: 'contains_rows',
        required_values: [
          { column: 'to_account', value: 'SHELL-7721' },
        ],
        min_rows: 5,
      },
      reveal_text:
        'Five transactions totaling $250,000 were sent to SHELL-7721, a shell company account. ' +
        'The money was then wired to the Cayman Islands. This is textbook money laundering.',
      evidence_summary: '$250K laundered through SHELL-7721 to Cayman Islands',
      timeline_entry: 'Aug-Dec: $250K transferred offshore via SHELL-7721',
      connects_to_clue: 2,
    },
    {
      id: 4,
      order: 4,
      narrative:
        'Bob couldn\'t have done this alone. Check the night bar\'s surveillance logs for suspicious meetings. ' +
        'Look for incidents flagged as "UNUSUAL_BEHAVIOR" involving multiple patrons.',
      hint: 'Query surveillance_logs for incident_type = \'UNUSUAL_BEHAVIOR\' and check the descriptions.',
      stronger_hint:
        'Try: SELECT log_date, log_time, description, reviewed FROM surveillance_logs WHERE incident_type = \'UNUSUAL_BEHAVIOR\' ORDER BY log_date',
      validation: {
        type: 'contains_rows',
        required_values: [
          { column: 'incident_type', value: 'UNUSUAL_BEHAVIOR' },
        ],
        min_rows: 2,
      },
      reveal_text:
        'Security cameras caught Bob meeting with another person at the bar multiple times — always late at night, always in a corner booth. ' +
        'They were exchanging envelopes. Someone is helping him.',
      evidence_summary: 'Bob meeting accomplice at night bar — envelope exchanges',
      timeline_entry: 'Aug-Nov: Regular secret meetings at night bar',
      connects_to_clue: 3,
    },
    {
      id: 5,
      order: 5,
      narrative:
        'Let\'s establish a pattern. Check if Bob had dinner reservations at the bistro on specific dates. ' +
        'Look for reservations under "Bob Martinez" or variations like "Martinez" or "Bob M."',
      hint: 'Query the reservations table for guest names containing "Bob" or "Martinez".',
      stronger_hint:
        'Try: SELECT reservation_date, reservation_time, guest_name, party_size, special_requests FROM reservations WHERE guest_name LIKE \'%Bob%\' OR guest_name LIKE \'%Martinez%\' ORDER BY reservation_date',
      validation: {
        type: 'contains_rows',
        required_values: [
          { column: 'guest_name', value: 'Bob Martinez' },
        ],
        min_rows: 3,
      },
      reveal_text:
        'Bob had dinner reservations the night before each fraudulent transfer — always for two people, always requesting privacy. ' +
        'These weren\'t random dates. He was planning each theft over dinner.',
      evidence_summary: 'Dinner meetings night before each transfer',
      timeline_entry: 'Pattern: Bistro dinners precede each transfer',
      connects_to_clue: 4,
    },
    {
      id: 6,
      order: 6,
      narrative:
        'Time to identify the accomplice. Bob lives in unit 27B at the high-rise condo. ' +
        'Check the visitor_logs to see who visited him on the nights before the transfers.',
      hint: 'Query visitor_logs for resident_unit = \'27B\' and look at visit dates and visitor names.',
      stronger_hint:
        'Try: SELECT visit_date, visitor_name, check_in_time, check_out_time, purpose FROM visitor_logs WHERE resident_unit = \'27B\' ORDER BY visit_date',
      validation: {
        type: 'contains_rows',
        required_values: [
          { column: 'visitor_name', value: 'Grace Liu' },
          { column: 'resident_unit', value: '27B' },
        ],
        min_rows: 4,
      },
      reveal_text:
        'Grace Liu visited Bob\'s condo the night before each transfer — including one visit where she never checked out. ' +
        'She\'s the accomplice. Grace used her IT access to delete audit logs while Bob moved the money. Case closed.',
      evidence_summary: 'Grace Liu visited Bob before each transfer — accomplice confirmed',
      timeline_entry: 'Grace Liu: The accomplice who covered their tracks',
      connects_to_clue: 5,
    },
  ],

  solution: {
    culprit: 'Bob Martinez',
    motive:
      'Financial gain — Bob Martinez, a junior accountant earning $72K annually, embezzled $250,000 through a shell account (SHELL-7721) and laundered it to the Cayman Islands, with IT sysadmin Grace Liu as his accomplice covering their tracks.',
    final_narrative:
      'The case is closed. The investigation traced Bob Martinez through six locations: ' +
      'His late-night office access on floor 5 raised the first red flag. Police records confirmed an active fraud investigation. ' +
      'Bank records revealed $250,000 funneled through SHELL-7721 to offshore accounts. ' +
      'Night bar surveillance caught him in secret meetings with an accomplice. ' +
      'Bistro reservations showed a pattern — dinner meetings the night before each transfer. ' +
      'Finally, condo visitor logs confirmed Grace Liu visited Bob before every theft, using her IT access to delete audit logs while Bob moved the money. ' +
      'Both suspects have been arrested. Outstanding detective work.',
  },
};
