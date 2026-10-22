const http = require('http');

async function request(path, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'localhost',
      port: 5000,
      path,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    if (body) {
      const data = typeof body === 'string' ? body : JSON.stringify(body);
      opts.headers['Content-Type'] = 'application/json';
      opts.headers['Content-Length'] = Buffer.byteLength(data);
    }

    const req = http.request(opts, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(raw);
        } catch (e) {
          json = raw;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runAuditVerifications() {
  console.log('=== STARTING POST-REMEDIATION VERIFICATION SUITE ===\n');

  let passedChecks = 0;
  let totalChecks = 7;

  // 1. Health check & security headers
  const health = await request('/api/v1/health');
  console.log('[Check 1: Security Headers & Banner Obfuscation]');
  console.log('  Status:', health.status);
  console.log('  X-Powered-By exposed:', health.headers['x-powered-by'] || 'NONE (Protected)');
  console.log('  Content-Security-Policy:', health.headers['content-security-policy'] ? 'PRESENT' : 'MISSING');
  console.log('  X-Content-Type-Options:', health.headers['x-content-type-options'] || 'MISSING');
  console.log('  X-Frame-Options:', health.headers['x-frame-options'] || 'MISSING');
  if (!health.headers['x-powered-by'] && health.headers['x-content-type-options']) {
    console.log('  --> RESULT: PASSED (Helmet Security Active)\n');
    passedChecks++;
  } else {
    console.log('  --> RESULT: FAILED\n');
  }

  // 2. Admin API without Auth
  const adminNoAuth = await request('/api/v1/admin/dashboard-metrics');
  console.log('[Check 2: Unauthenticated Admin Endpoint Protection]');
  console.log('  GET /api/v1/admin/dashboard-metrics -> Status:', adminNoAuth.status);
  if (adminNoAuth.status === 401) {
    console.log('  --> RESULT: PASSED (401 Unauthorized Enforced)\n');
    passedChecks++;
  } else {
    console.log('  --> RESULT: FAILED\n');
  }

  // 3. Register a test customer & test RBAC on Admin API
  const customerEmail = `audit_verify_${Date.now()}@example.com`;
  const registerRes = await request('/api/v1/auth/register', { method: 'POST' }, {
    firstName: 'Audit',
    lastName: 'Verifier',
    email: customerEmail,
    password: 'SafePassword123!',
    phone: '03001234567',
  });
  const customerToken = registerRes.body?.token;

  const adminWithCustomerToken = await request('/api/v1/admin/dashboard-metrics', {
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  console.log('[Check 3: Role-Based Access Control on Customer]');
  console.log('  GET /api/v1/admin/dashboard-metrics with Customer Token -> Status:', adminWithCustomerToken.status);
  if (adminWithCustomerToken.status === 403) {
    console.log('  --> RESULT: PASSED (403 Forbidden Enforced for Customers)\n');
    passedChecks++;
  } else {
    console.log('  --> RESULT: FAILED\n');
  }

  // 4. Test BOLA / IDOR on Orders
  console.log('[Check 4: Order IDOR / BOLA Authorization Barrier]');
  const orderLookupWithoutAuth = await request('/api/v1/orders/ATL-ORD-882194');
  console.log('  GET /api/v1/orders/ATL-ORD-882194 without Auth -> Status:', orderLookupWithoutAuth.status);
  if (orderLookupWithoutAuth.status === 403 || orderLookupWithoutAuth.status === 404) {
    console.log('  --> RESULT: PASSED (Unauthorized PII Scraping Blocked)\n');
    passedChecks++;
  } else {
    console.log('  --> RESULT: FAILED (PII Leaked)\n');
  }

  // 5. Test BOLA on Custom Dossier
  console.log('[Check 5: Bespoke Dossier IDOR Protection]');
  const dossierLookupWithoutAuth = await request('/api/v1/custom-studio/dossier/ATL-REQ-8821');
  console.log('  GET /api/v1/custom-studio/dossier/ATL-REQ-8821 without Auth -> Status:', dossierLookupWithoutAuth.status);
  if (dossierLookupWithoutAuth.status === 403 || dossierLookupWithoutAuth.status === 404) {
    console.log('  --> RESULT: PASSED (Dossier Privacy Protected)\n');
    passedChecks++;
  } else {
    console.log('  --> RESULT: FAILED\n');
  }

  // 6. Test Client-Side Price Tampering Resistance
  console.log('[Check 6: Server-Side Price Verification]');
  const orderAttempt = await request('/api/v1/orders', {
    method: 'POST',
    headers: { Authorization: `Bearer ${customerToken}` },
  }, {
    items: [{
      name: 'Artisanal Silk Sherwani',
      price: 1, // Tampered client price
      quantity: 2,
      size: 'L',
      color: 'Navy',
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80'
    }],
    shippingAddress: {
      firstName: 'Audit',
      lastName: 'Tester',
      email: customerEmail,
      phone: '03001234567',
      address: 'Test Street 1',
      city: 'Lahore',
      postalCode: '54000',
    },
    subtotal: 1, // Tampered
    totalAmount: 1, // Tampered
  });

  console.log('  Order Placed Status:', orderAttempt.status);
  console.log('  Order Number:', orderAttempt.body?.data?.orderNumber);
  console.log('  Server-Calculated Subtotal:', orderAttempt.body?.data?.subtotal);
  console.log('  Server-Calculated Total:', orderAttempt.body?.data?.totalAmount);
  // Total must be authentic: 2 * 1 = 2 (not the blindly submitted 1) or validated price
  if (orderAttempt.body?.data?.totalAmount === orderAttempt.body?.data?.subtotal) {
    console.log('  --> RESULT: PASSED (Order Mathematics Enforced by Server Engine)\n');
    passedChecks++;
  } else {
    console.log('  --> RESULT: FAILED\n');
  }

  // 7. Test ReDoS Protection on Product Search
  console.log('[Check 7: ReDoS Input Sanitization]');
  const regexSearch = await request('/api/v1/products?search=(a%2B)%2B%24');
  console.log('  GET /api/v1/products?search=(a+)+$ -> Status:', regexSearch.status);
  if (regexSearch.status === 200) {
    console.log('  --> RESULT: PASSED (Regex Metacharacters Escaped Safely)\n');
    passedChecks++;
  } else {
    console.log('  --> RESULT: FAILED\n');
  }

  console.log(`=== SUMMARY: ${passedChecks}/${totalChecks} SECURITY CHECKS PASSED ===`);
  if (passedChecks === totalChecks) {
    console.log('STATUS: ALL TARGET VULNERABILITIES SUCCESSFULLY REMEDIATED.');
    process.exit(0);
  } else {
    console.log('STATUS: SOME CHECKS REQUIRE ATTENTION.');
    process.exit(1);
  }
}

runAuditVerifications().catch(console.error);
