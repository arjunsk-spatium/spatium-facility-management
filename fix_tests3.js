const fs = require('fs');

const dirs = [
  'tenant-app/tests/helpdesk/index.nuxt.test.ts',
  'tenant-app/tests/facilities/index.nuxt.test.ts',
  'tenant-app/tests/meeting-rooms/bookings.nuxt.test.ts',
  'tenant-app/tests/meeting-rooms/index.nuxt.test.ts',
  'tenant-app/tests/visitors/index.nuxt.test.ts'
];

dirs.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/permissions: \[\]/g, "permissions: ['meeting-rooms-bookings:view', 'meeting-rooms-bookings:create', 'facilities:view', 'meeting-rooms:view', 'meeting-rooms:create', 'helpdesk:view', 'helpdesk:create', 'visitors:view', 'visitor_sticker_print']");
  fs.writeFileSync(file, content);
});
