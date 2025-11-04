const db = require('../config/database');
const { promisify } = require('util');

const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));

// Custom dbRun
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
};

const getAllMenus = async (req, res) => {
  try {
    const menus = await dbAll(
      'SELECT * FROM menus ORDER BY order_index'
    );

    res.json({
      success: true,
      data: menus
    });

  } catch (error) {
    console.error('Get all menus error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ' 
    });
  }
};

const getMenuById = async (req, res) => {
  try {
    const menu = await dbGet(
      'SELECT * FROM menus WHERE id = ?',
      [req.params.id]
    );

    if (!menu) {
      return res.status(404).json({ 
        success: false, 
        message: 'ບໍ່ພົບເມນູນີ້' 
      });
    }

    res.json({
      success: true,
      data: menu
    });

  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ' 
    });
  }
};

const createMenu = async (req, res) => {
  try {
    const { name, path, icon, orderIndex, parentId } = req.body;

    if (!name || !path) {
      return res.status(400).json({ 
        success: false, 
        message: 'ກະລຸນາປ້ອນຊື່ ແລະ path ຂອງເມນູ' 
      });
    }

    const result = await dbRun(
      `INSERT INTO menus (name, path, icon, order_index, parent_id)
       VALUES (?, ?, ?, ?, ?)`,
      [name, path, icon, orderIndex || 0, parentId || null]
    );

    res.status(201).json({
      success: true,
      message: 'ສ້າງເມນູສຳເລັດ',
      data: { id: result.lastID }
    });

  } catch (error) {
    console.error('Create menu error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'ເກີດຂໍ້ຜິດພາດໃນການສ້າງເມນູ' 
    });
  }
};

const updateMenu = async (req, res) => {
  try {
    const { name, path, icon, orderIndex, parentId, isActive } = req.body;

    await dbRun(
      `UPDATE menus 
       SET name = ?, path = ?, icon = ?, order_index = ?, parent_id = ?, is_active = ?
       WHERE id = ?`,
      [name, path, icon, orderIndex, parentId, isActive ? 1 : 0, req.params.id]
    );

    res.json({
      success: true,
      message: 'ອັບເດດເມນູສຳເລັດ'
    });

  } catch (error) {
    console.error('Update menu error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'ເກີດຂໍ້ຜິດພາດໃນການອັບເດດ' 
    });
  }
};

const deleteMenu = async (req, res) => {
  try {
    await dbRun('DELETE FROM menus WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'ລຶບເມນູສຳເລັດ'
    });

  } catch (error) {
    console.error('Delete menu error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'ເກີດຂໍ້ຜິດພາດໃນການລຶບ' 
    });
  }
};

module.exports = {
  getAllMenus,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu
};