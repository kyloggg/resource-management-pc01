import { test, expect } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';

const BASE_URL = 'http://localhost:5050';
const RESOURCES_FILE = path.resolve('utils/resources.json');

test.beforeEach(async () => {
  const initialData = [
    {
      id: 'kb-chromium',
      name: 'Keyboard-chromium',
      location: 'Room 101',
      description: 'Wireless keyboard',
      owner: 'admin@example.com',
    },
    {
      id: 'mn-chromium',
      name: 'Monitor-chromium',
      location: 'Room 101',
      description: 'HP Monitor',
      owner: 'admin@example.com',
    },
    {
      id: 'lt-chromium',
      name: 'Laptop-chromium',
      location: 'Room 101',
      description: 'Dell Laptop',
      owner: 'admin@example.com',
    },
  ];

  await fs.writeFile(
    RESOURCES_FILE,
    JSON.stringify(initialData, null, 2),
    'utf-8',
  );

  console.log('resources.json initialized');
});

test.describe('Resource Mgmt CRUD Frontend Tests', () => {
  test('Create Resource', async ({ page }) => {
    await page.goto(BASE_URL);

    const resourceName = 'Projector-chromium';


    // Open the Add Resource modal
    await page.locator('button:has-text("Add Resource")').click();

    // Fill in the resource details
    await page.locator('#name').fill(resourceName);
    await page.locator('#location').fill('Room 101');
    await page.locator('#description').fill('HD Projector');
    await page.locator('#owner').fill('admin@example.com');

    // Accept the confirmation dialog when it appears
    page.once('dialog', dialog => dialog.accept());

    // Submit the new resource
    await page.locator('button:has-text("Add New Resource")').click();

    // Wait for the modal to close
    await page.locator('#resourceModal').waitFor({
      state: 'hidden',
      timeout: 10000,
    });

    // Locate the newly created resource in the table
    const row = page.locator('#tableContent tr', {
      hasText: resourceName,
    });

    // Verify that the new resource is displayed
    await expect(row).toBeVisible();
  });

  test('View Resources', async ({ page }) => {
    await page.goto(BASE_URL);

    // Verify that the resource table is visible
    await expect(page.locator('table')).toBeVisible();

    // Locate the existing keyboard resource
    const row = page.locator('#tableContent tr', {
      hasText: 'Keyboard-chromium'
    });

    // Verify that the keyboard resource is displayed
    await expect(row).toBeVisible();
  });

  test('Edit Resource', async ({ page }) => {
    await page.goto(BASE_URL);

    // Locate the monitor resource to edit
    const row = page.locator('#tableContent tr', {
      hasText: 'Monitor-chromium',
    });

    // Click the Edit button
    await row.locator('button:has-text("Edit")').click();

    const newName = 'Updated Monitor-chromium';

    // Fill in the updated resource details
    await page.locator('#editName').fill(newName);
    await page.locator('#editLocation').fill('Room 102');
    await page.locator('#editDescription').fill('HP 32 inch Monitor');

    // Accept the confirmation dialog when it appears
    page.once('dialog', dialog => dialog.accept());

    // Submit the updated resource
    await page.locator('button:has-text("Update Resource")').click();

    // Wait for the edit modal to close
    await page.locator('#resourceModal').waitFor({
      state: 'hidden',
      timeout: 10000,
    });

    // Locate the updated resource in the table
    const updatedRow = page.locator('#tableContent tr', {
      hasText: newName,
    });

    // Verify that the updated resource is displayed
    await expect(updatedRow).toBeVisible();

    // Verify the updated resource details
    await expect(updatedRow.locator('td').nth(1)).toHaveText(newName);
    await expect(updatedRow.locator('td').nth(2)).toHaveText('Room 102');
    await expect(updatedRow.locator('td').nth(3)).toHaveText(
      'HP 32 inch Monitor',
    );
  });

  test('Delete Resource', async ({ page }) => {
    await page.goto(BASE_URL);

    // Identify the resource to delete
    const resourceName = 'Laptop-chromium';

    const row = page.locator('#tableContent tr', {
      hasText: resourceName,
    });

    // Verify that the resource exists in the table
    await expect(row).toHaveCount(1);

    // Accept the confirmation dialog when it appears
    page.once('dialog', dialog => dialog.accept());

    // Click the Delete button
    await row.locator('button:has-text("Delete")').click();

    // Verify that the resource is removed from the table
    await expect(
      page.locator('#tableContent tr', { hasText: resourceName }),
    ).toHaveCount(0, { timeout: 10000 });
  });
});
