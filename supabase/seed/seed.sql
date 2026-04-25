-- ─────────────────────────────────────────────────────────────
-- Pasion Balcanica — seed data
-- Sarajevo emergency and tourist-info numbers.
-- Run AFTER migrations. Safe to re-run (uses on conflict do nothing).
-- ─────────────────────────────────────────────────────────────

insert into public.important_numbers
  (label_es, label_en, phone_number, category, icon, description_es, description_en, display_order)
values
  ('Emergencias (general)',       'Emergency (general)',       '112', 'emergency',    'alert-triangle', 'Número único europeo de emergencias.',               'European single emergency number.',                 1),
  ('Policía',                     'Police',                    '122', 'emergency',    'shield',         'Policía de Bosnia y Herzegovina.',                    'Bosnia and Herzegovina Police.',                    2),
  ('Bomberos',                    'Fire department',           '123', 'emergency',    'flame',          'Servicio de bomberos de Sarajevo.',                   'Sarajevo fire service.',                            3),
  ('Ambulancia',                  'Ambulance',                 '124', 'medical',      'ambulance',      'Emergencias médicas.',                                'Medical emergencies.',                              4),
  ('Asistencia en carretera',     'Roadside assistance',       '1282','transport',    'car',            'Asistencia vial BIHAMK.',                             'BIHAMK road assistance.',                           5),
  ('Info turística de Sarajevo',  'Sarajevo tourist info',     '+38733580999','tourist_info','map',      'Oficina de turismo de Sarajevo.',                     'Sarajevo Tourism Office.',                          6),
  ('Aeropuerto de Sarajevo',      'Sarajevo Airport',          '+38733289100','transport', 'plane',     'Información del aeropuerto internacional.',           'International airport information.',                7),
  ('Estación de autobuses',       'Bus station',               '+38733213100','transport', 'bus',       'Estación central de autobuses.',                      'Central bus station.',                              8)
on conflict do nothing;
