const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000/api/v1';
const LESSON_PATH = path.join(__dirname, 'java_strings_lesson.json');

async function run() {
  try {
    // 1. Read lesson JSON file
    console.log(`Reading lesson JSON file from ${LESSON_PATH}...`);
    const fileContent = fs.readFileSync(LESSON_PATH, 'utf8');
    const lessonJson = JSON.parse(fileContent);
    console.log('Lesson JSON loaded successfully.');

    // 2. Perform Login POST to get JWT token
    console.log('\n--- 1. Login ---');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@studyplatform.com',
        password: 'Admin123456!'
      })
    });

    if (!loginRes.ok) {
      const errText = await loginRes.text();
      throw new Error(`Login failed with status ${loginRes.status}: ${errText}`);
    }

    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Login successful! JWT Token acquired.');

    // 3. Upload JSON via POST to /upload/json
    console.log('\n--- 2. Upload Lesson JSON ---');
    const uploadRes = await fetch(`${BASE_URL}/upload/json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        courseId: 'course-java-fundamentals',
        jsonContent: lessonJson
      })
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      throw new Error(`Upload failed with status ${uploadRes.status}: ${errText}`);
    }

    const uploadData = await uploadRes.json();
    console.log('Upload successful! Response payload:');
    console.log(JSON.stringify(uploadData, null, 2));

    // 4. Verify via GET to /lessons/lesson_java_strings_001
    console.log('\n--- 3. Verify Lesson via GET ---');
    const getRes = await fetch(`${BASE_URL}/lessons/lesson_java_strings_001`);
    if (!getRes.ok) {
      const errText = await getRes.text();
      throw new Error(`GET lesson failed with status ${getRes.status}: ${errText}`);
    }

    const lessonData = await getRes.json();
    console.log('Verification successful! Retrieved Lesson data:');
    console.log(JSON.stringify(lessonData, null, 2));

    console.log('\n🎉 Verification completed successfully!');
  } catch (error) {
    console.error('❌ Error during validation:', error.message);
    process.exit(1);
  }
}

run();
