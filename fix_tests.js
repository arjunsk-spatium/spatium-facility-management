const fs = require('fs');

const dirs = [
  'tenant-app/tests/helpdesk/index.nuxt.test.ts',
  'tenant-app/tests/facilities/index.nuxt.test.ts',
  'tenant-app/tests/meeting-rooms/bookings.nuxt.test.ts',
  'tenant-app/tests/meeting-rooms/index.nuxt.test.ts',
  'tenant-app/tests/visitors/index.nuxt.test.ts'
];

dirs.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/initialState: \{/g, "initialState: {\n                        auth: { modules: ['helpdesk', 'facilities', 'meeting_rooms', 'visitors'], permissions: [] },");
  fs.writeFileSync(file, content);
});
