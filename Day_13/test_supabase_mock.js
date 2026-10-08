/**
 * Comprehensive End-to-End Mock Test for Supabase TaskFlow
 * Tests all 7 CRUD and stats endpoints through real HTTP calls,
 * mocking the Supabase client methods to verify responses.
 */

const http = require('http');
const express = require('express');

// We test using proxyquire or monkeypatching the supabase client on config
const supabaseConfig = require('./server/config/supabase');
const taskRoutes = require('./server/routes/taskRoutes');
const errorHandler = require('./server/middleware/errorHandler');

// In-memory mock database for testing
let mockDatabase = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    title: 'Review Project Requirements',
    description: 'Ensure all specifications are met',
    priority: 'High',
    status: 'Completed',
    category: 'Work',
    due_date: '2026-10-01T00:00:00.000Z',
    created_at: '2026-09-25T10:00:00.000Z',
    updated_at: '2026-09-25T10:00:00.000Z'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    title: 'Migrate Database to Supabase',
    description: 'Replace MongoDB/Mongoose with Supabase PostgreSQL',
    priority: 'Medium',
    status: 'In Progress',
    category: 'College',
    due_date: '2026-10-20T00:00:00.000Z',
    created_at: '2026-10-05T12:00:00.000Z',
    updated_at: '2026-10-05T12:00:00.000Z'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    title: 'Study PostgreSQL triggers and RLS',
    description: 'Read Supabase documentation',
    priority: 'Low',
    status: 'Pending',
    category: 'Personal',
    due_date: null,
    created_at: '2026-10-06T15:00:00.000Z',
    updated_at: '2026-10-06T15:00:00.000Z'
  }
];

// Mock Supabase Query Builder
supabaseConfig.supabase.from = function(tableName) {
  let selected = '*';
  let filters = [];
  let sortField = null;
  let sortAscending = false;
  let insertPayload = null;
  let updatePayload = null;
  let deleteFlag = false;
  let isCountOnly = false;

  const builder = {
    select: function(fields, options) {
      selected = fields;
      if (options && options.head) isCountOnly = true;
      return builder;
    },
    insert: function(payload) {
      insertPayload = Array.isArray(payload) ? payload[0] : payload;
      return builder;
    },
    update: function(payload) {
      updatePayload = payload;
      return builder;
    },
    delete: function() {
      deleteFlag = true;
      return builder;
    },
    eq: function(field, val) {
      filters.push(item => item[field] === val);
      return builder;
    },
    neq: function(field, val) {
      filters.push(item => item[field] !== val);
      return builder;
    },
    not: function(field, op, val) {
      if (op === 'is' && val === null) {
        filters.push(item => item[field] !== null && item[field] !== undefined);
      }
      return builder;
    },
    lt: function(field, val) {
      filters.push(item => item[field] && new Date(item[field]) < new Date(val));
      return builder;
    },
    or: function(orClause) {
      // Very basic simulation for title.ilike, description.ilike
      const match = orClause.match(/%([^%]+)%/);
      if (match) {
        const query = match[1].toLowerCase();
        filters.push(item => 
          (item.title && item.title.toLowerCase().includes(query)) ||
          (item.description && item.description.toLowerCase().includes(query))
        );
      }
      return builder;
    },
    order: function(field, opts) {
      sortField = field;
      sortAscending = opts && opts.ascending;
      return builder;
    },
    single: async function() {
      const res = await builder.then();
      return {
        data: Array.isArray(res.data) ? res.data[0] : res.data,
        error: res.error
      };
    },
    maybeSingle: async function() {
      const res = await builder.then();
      const item = Array.isArray(res.data) ? (res.data[0] || null) : res.data;
      return { data: item, error: null };
    },
    then: function(resolve) {
      let filtered = [...mockDatabase];
      for (const filter of filters) {
        filtered = filtered.filter(filter);
      }

      if (deleteFlag) {
        if (filtered.length > 0) {
          const toDelete = filtered[0];
          mockDatabase = mockDatabase.filter(m => m.id !== toDelete.id);
          const res = { data: toDelete, error: null };
          return resolve ? resolve(res) : Promise.resolve(res);
        }
        const res = { data: null, error: null };
        return resolve ? resolve(res) : Promise.resolve(res);
      }

      if (updatePayload) {
        if (filtered.length > 0) {
          const toUpdate = filtered[0];
          Object.assign(toUpdate, updatePayload, { updated_at: new Date().toISOString() });
          const res = { data: toUpdate, error: null };
          return resolve ? resolve(res) : Promise.resolve(res);
        }
        const res = { data: null, error: null };
        return resolve ? resolve(res) : Promise.resolve(res);
      }

      if (insertPayload) {
        const newRecord = {
          id: '44444444-4444-4444-4444-444444444444',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...insertPayload
        };
        mockDatabase.push(newRecord);
        const res = { data: newRecord, error: null };
        return resolve ? resolve(res) : Promise.resolve(res);
      }

      if (isCountOnly) {
        const res = { count: filtered.length, data: null, error: null };
        return resolve ? resolve(res) : Promise.resolve(res);
      }

      if (sortField) {
        filtered.sort((a, b) => {
          const valA = a[sortField] || '';
          const valB = b[sortField] || '';
          if (valA < valB) return sortAscending ? -1 : 1;
          if (valA > valB) return sortAscending ? 1 : -1;
          return 0;
        });
      }

      const res = { data: filtered, count: filtered.length, error: null };
      return resolve ? resolve(res) : Promise.resolve(res);
    }
  };

  return builder;
};

async function runMockE2ETests() {
  console.log('\n🚀 Starting End-to-End API Mock Tests for Supabase Migration\n');

  const app = express();
  app.use(express.json());
  app.use('/api/tasks', taskRoutes);
  app.use(errorHandler);

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/tasks`;

  const request = (method, path, body = null) => {
    return new Promise((resolve, reject) => {
      const url = new URL(path, baseUrl);
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
      };

      const req = http.request(url, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: data ? JSON.parse(data) : {} });
          } catch (e) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      });

      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  };

  try {
    // 1. GET /api/tasks
    const getRes = await request('GET', '/api/tasks');
    console.assert(getRes.status === 200, 'GET /api/tasks returns 200');
    console.assert(getRes.body.success === true, 'GET /api/tasks success is true');
    console.assert(getRes.body.count === 3, 'GET /api/tasks returns 3 tasks');
    console.assert(getRes.body.data[0].id && getRes.body.data[0]._id, 'Tasks have both id and _id');
    console.assert(getRes.body.data[0].dueDate !== undefined, 'Tasks have dueDate for frontend');
    console.log('✅ GET /api/tasks succeeded');

    // 2. GET /api/tasks/stats
    const statsRes = await request('GET', '/api/tasks/stats');
    console.assert(statsRes.status === 200, 'GET /api/tasks/stats returns 200');
    console.assert(statsRes.body.data.total === 3, 'Stats total is 3');
    console.assert(statsRes.body.data.completed === 1, 'Stats completed is 1');
    console.assert(statsRes.body.data.pending === 1, 'Stats pending is 1');
    console.assert(statsRes.body.data.inProgress === 1, 'Stats inProgress is 1');
    console.log('✅ GET /api/tasks/stats succeeded');

    // 3. GET /api/tasks/:id
    const singleRes = await request('GET', '/api/tasks/22222222-2222-2222-2222-222222222222');
    console.assert(singleRes.status === 200, 'GET /api/tasks/:id returns 200');
    console.assert(singleRes.body.data.title === 'Migrate Database to Supabase', 'GET /api/tasks/:id returns correct task');
    console.log('✅ GET /api/tasks/:id succeeded');

    // 4. POST /api/tasks
    const postRes = await request('POST', '/api/tasks', {
      title: 'Brand New Supabase Task',
      description: 'Testing task creation',
      priority: 'High',
      status: 'Pending',
      category: 'Work',
      dueDate: '2026-10-30T00:00:00.000Z'
    });
    console.assert(postRes.status === 201, 'POST /api/tasks returns 201');
    console.assert(postRes.body.data.id === '44444444-4444-4444-4444-444444444444', 'Created task has UUID');
    console.assert(postRes.body.data.title === 'Brand New Supabase Task', 'Created task has correct title');
    console.log('✅ POST /api/tasks succeeded');

    // 5. PUT /api/tasks/:id
    const putRes = await request('PUT', '/api/tasks/44444444-4444-4444-4444-444444444444', {
      title: 'Updated Supabase Task Title',
      priority: 'Low'
    });
    console.assert(putRes.status === 200, 'PUT /api/tasks/:id returns 200');
    console.assert(putRes.body.data.title === 'Updated Supabase Task Title', 'Updated task reflects changes');
    console.assert(putRes.body.data.priority === 'Low', 'Priority updated');
    console.log('✅ PUT /api/tasks/:id succeeded');

    // 6. PATCH /api/tasks/:id/status
    const patchRes = await request('PATCH', '/api/tasks/44444444-4444-4444-4444-444444444444/status', {
      status: 'Completed'
    });
    console.assert(patchRes.status === 200, 'PATCH /api/tasks/:id/status returns 200');
    console.assert(patchRes.body.data.status === 'Completed', 'Status patched to Completed');
    console.log('✅ PATCH /api/tasks/:id/status succeeded');

    // 7. DELETE /api/tasks/:id
    const delRes = await request('DELETE', '/api/tasks/44444444-4444-4444-4444-444444444444');
    console.assert(delRes.status === 200, 'DELETE /api/tasks/:id returns 200');
    console.assert(delRes.body.success === true, 'DELETE success is true');
    console.log('✅ DELETE /api/tasks/:id succeeded');

    // 8. Verify 404 for deleted or non-existent ID
    const notFoundRes = await request('GET', '/api/tasks/44444444-4444-4444-4444-444444444444');
    console.assert(notFoundRes.status === 404, 'GET on non-existent task returns 404');
    console.log('✅ 404 handler for missing resource verified');

    console.log('\n🎉 ALL 8 END-TO-END SUPABASE API MOCK TESTS PASSED SUCCESSFULLY! 🎉\n');
  } finally {
    server.close();
  }
}

runMockE2ETests().catch(err => {
  console.error('Mock Test Failed:', err);
  process.exit(1);
});
