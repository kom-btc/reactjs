//ສ້າງ Helper Function ກວດສອບ Admin Group
// backend/utils/checkAdminGroup.js
const db = require('../config/database');
const { promisify } = require('util');

const dbGet = promisify(db.get.bind(db));

/**
 * ກວດສອບວ່າ user ຢູ່ໃນ admin group ບໍ່
 * @param {number} userId - User ID
 * @returns {boolean} - true ຖ້າຢູ່ໃນ admin group
 */
const isUserInAdminGroup = async (userId) => {
  try {
    const result = await dbGet(
      `SELECT ug.user_id
       FROM user_groups ug
       INNER JOIN groups g ON ug.group_id = g.id
       WHERE ug.user_id = ? AND LOWER(g.name) = 'admin'`,
      [userId]
    );
    
    return !!result;
  } catch (error) {
    console.error('Error checking admin group:', error);
    return false;
  }
};

/**
 * ກວດສອບວ່າ user ມີສິດ admin (ທັງ flag ແລະ group)
 * @param {number} userId - User ID
 * @param {boolean} isAdminFlag - is_admin flag
 * @returns {boolean} - true ຖ້າມີສິດ admin
 */
const hasAdminAccess = async (userId, isAdminFlag) => {
  // ຖ້າມີ is_admin flag, ຜ່ານເລີຍ
  if (isAdminFlag) return true;
  
  // ບໍ່ງັ້ນກວດສອບ admin group
  return await isUserInAdminGroup(userId);
};

module.exports = {
  isUserInAdminGroup,
  hasAdminAccess
};