/**
 * Database Service Tests
 * Manual test scenarios to verify database operations
 *
 * NOTE: These are not automated tests. Run them manually during development.
 */

import {
  initializeDatabase,
  createCapsule,
  getCapsule,
  getAllCapsules,
  getCapsulesByStatus,
  getOpenedCapsules,
  updateCapsuleStatus,
  updateCapsuleReflection,
  checkAndUpdateReadyCapsules,
  deleteCapsule,
  addCapsuleImage,
  getCapsuleImages,
  deleteCapsuleImages,
  getSetting,
  setSetting,
  getAllSettings,
} from '../database';

/**
 * Test database initialization
 */
export async function testInitialization() {
  console.log('=== Testing Database Initialization ===');
  try {
    await initializeDatabase();
    console.log('✓ Database initialized successfully');
  } catch (error) {
    console.error('✗ Database initialization failed:', error);
  }
}

/**
 * Test capsule creation
 */
export async function testCreateCapsule() {
  console.log('\n=== Testing Capsule Creation ===');
  try {
    const now = Math.floor(Date.now() / 1000);
    const unlockAt = now + 86400 * 7; // 7 days from now

    const capsuleId = await createCapsule({
      type: 'emotion',
      title: 'Test Capsule',
      content: 'This is a test capsule content',
      createdAt: now,
      unlockAt: unlockAt,
      status: 'locked',
      reflectionQuestion: 'Did you overcome these emotions?',
      reflectionType: 'yes_no',
    });

    console.log(`✓ Capsule created with ID: ${capsuleId}`);
    return capsuleId;
  } catch (error) {
    console.error('✗ Capsule creation failed:', error);
  }
}

/**
 * Test capsule retrieval
 */
export async function testGetCapsule(capsuleId: string) {
  console.log('\n=== Testing Capsule Retrieval ===');
  try {
    const capsule = await getCapsule(capsuleId);
    if (capsule) {
      console.log('✓ Capsule retrieved:', capsule);
    } else {
      console.error('✗ Capsule not found');
    }
  } catch (error) {
    console.error('✗ Capsule retrieval failed:', error);
  }
}

/**
 * Test get all capsules
 */
export async function testGetAllCapsules() {
  console.log('\n=== Testing Get All Capsules ===');
  try {
    const capsules = await getAllCapsules();
    console.log(`✓ Retrieved ${capsules.length} capsule(s)`);
  } catch (error) {
    console.error('✗ Get all capsules failed:', error);
  }
}

/**
 * Test image operations
 */
export async function testImageOperations(capsuleId: string) {
  console.log('\n=== Testing Image Operations ===');
  try {
    // Add images
    await addCapsuleImage({
      capsuleId,
      uri: 'file:///test/image1.jpg',
      order: 0,
    });
    await addCapsuleImage({
      capsuleId,
      uri: 'file:///test/image2.jpg',
      order: 1,
    });
    console.log('✓ Images added');

    // Get images
    const images = await getCapsuleImages(capsuleId);
    console.log(`✓ Retrieved ${images.length} image(s)`);
  } catch (error) {
    console.error('✗ Image operations failed:', error);
  }
}

/**
 * Test status update
 */
export async function testStatusUpdate(capsuleId: string) {
  console.log('\n=== Testing Status Update ===');
  try {
    await updateCapsuleStatus(capsuleId, 'ready');
    console.log('✓ Status updated to ready');

    const capsule = await getCapsule(capsuleId);
    if (capsule && capsule.status === 'ready') {
      console.log('✓ Status verified');
    }
  } catch (error) {
    console.error('✗ Status update failed:', error);
  }
}

/**
 * Test reflection update
 */
export async function testReflectionUpdate(capsuleId: string) {
  console.log('\n=== Testing Reflection Update ===');
  try {
    await updateCapsuleReflection(capsuleId, 'yes');
    console.log('✓ Reflection answer updated');

    const capsule = await getCapsule(capsuleId);
    if (capsule && capsule.reflectionAnswer === 'yes') {
      console.log('✓ Reflection answer verified');
    }
  } catch (error) {
    console.error('✗ Reflection update failed:', error);
  }
}

/**
 * Test settings operations
 */
export async function testSettingsOperations() {
  console.log('\n=== Testing Settings Operations ===');
  try {
    // Set settings
    await setSetting('onboardingCompleted', true);
    await setSetting('notificationsEnabled', false);
    console.log('✓ Settings saved');

    // Get setting
    const onboarding = await getSetting('onboardingCompleted');
    console.log(`✓ onboardingCompleted: ${onboarding}`);

    // Get all settings
    const allSettings = await getAllSettings();
    console.log(`✓ Retrieved ${Object.keys(allSettings).length} setting(s)`);
  } catch (error) {
    console.error('✗ Settings operations failed:', error);
  }
}

/**
 * Test capsule deletion
 */
export async function testDeleteCapsule(capsuleId: string) {
  console.log('\n=== Testing Capsule Deletion ===');
  try {
    // First update to opened status (can only delete opened capsules)
    await updateCapsuleStatus(capsuleId, 'opened');

    // Then delete
    await deleteCapsule(capsuleId);
    console.log('✓ Capsule deleted');

    // Verify deletion
    const capsule = await getCapsule(capsuleId);
    if (!capsule) {
      console.log('✓ Deletion verified');
    }
  } catch (error) {
    console.error('✗ Capsule deletion failed:', error);
  }
}

/**
 * Run all tests
 */
export async function runAllTests() {
  console.log('========================================');
  console.log('  Database Service Test Suite');
  console.log('========================================');

  await testInitialization();
  await testSettingsOperations();

  const capsuleId = await testCreateCapsule();
  if (capsuleId) {
    await testGetCapsule(capsuleId);
    await testGetAllCapsules();
    await testImageOperations(capsuleId);
    await testStatusUpdate(capsuleId);
    await testReflectionUpdate(capsuleId);
    await testDeleteCapsule(capsuleId);
  }

  console.log('\n========================================');
  console.log('  Tests Completed');
  console.log('========================================');
}
