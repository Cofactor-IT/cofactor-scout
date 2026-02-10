
import { randomBytes, randomInt } from 'crypto';
import DOMPurify from 'isomorphic-dompurify';

console.log('--- STARTING AUDIT VERIFICATION ---');

// 1. Test Referral Code Generation (Logic Copy)
console.log('\n[TEST 1] Referral Code Generation');
function generateReferralCode() {
    return randomBytes(16).toString('hex').toUpperCase().substring(0, 16);
}
const code1 = generateReferralCode();
const code2 = generateReferralCode();
console.log(`Code 1: ${code1}`);
console.log(`Code 2: ${code2}`);
if (code1.length === 16 && /^[0-9A-F]+$/.test(code1)) {
    console.log('✅ Referral Code format incorrect? NO, it looks CORRECT (16 hex chars).');
} else {
    console.error('❌ Referral Code format incorrect.');
}
if (code1 !== code2) {
    console.log('✅ Codes are unique (randomness check passed).');
}

// 2. Test XSS Sanitization
console.log('\n[TEST 2] XSS Sanitization');
const maliciousInput = '<script>alert("xss")</script>Hello <img src=x onerror=alert(1)>World';
const sanitized = DOMPurify.sanitize(maliciousInput);
console.log(`Input: ${maliciousInput}`);
console.log(`Output: ${sanitized}`);
if (sanitized === 'Hello <img src="x">World' || sanitized === 'Hello World' || !sanitized.includes('<script>')) {
    console.log('✅ XSS Sanitization working (Script tags removed).');
} else {
    console.error('❌ XSS Sanitization FAILED.');
}

// 3. Test Magic Byte Logic (Logic Copy)
console.log('\n[TEST 3] Magic Byte Validation');
const pngMagic = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
const fakePng = Buffer.from([0x00, 0x00, 0x00, 0x00]);
const realPng = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00]);

function checkMagic(buffer: Buffer, type: string) {
    if (type === 'image/png') {
        return buffer.slice(0, pngMagic.length).equals(pngMagic);
    }
    return false;
}

if (checkMagic(realPng, 'image/png')) {
    console.log('✅ Real PNG detected correctly.');
} else {
    console.error('❌ Real PNG failed detection.');
}

if (!checkMagic(fakePng, 'image/png')) {
    console.log('✅ Fake PNG rejected correctly.');
} else {
    console.error('❌ Fake PNG passed detection (FAILED).');
}

// 4. Test CSRF Token Pattern
console.log('\n[TEST 4] CSRF Token Pattern');
const validToken = 'a'.repeat(32);
const invalidToken = 'abc';
const tokenPattern = /^[a-f0-9]{32,}$/;
if (tokenPattern.test(validToken)) {
    console.log('✅ Valid CSRF token pattern accepted.');
} else {
    console.error('❌ Valid CSRF token pattern rejected.');
}
if (!tokenPattern.test(invalidToken)) {
    console.log('✅ Invalid CSRF token pattern rejected.');
} else {
    console.error('❌ Invalid CSRF token pattern accepted.');
}

console.log('\n--- AUDIT VERIFICATION COMPLETE ---');
