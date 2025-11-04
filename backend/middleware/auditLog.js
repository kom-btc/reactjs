const db = require('../config/database'); // ປັບ path ໃຫ້ຖືກຕ້ອງ
const auditLog = (action, resource) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function (data) {
      const userId = req.user?.id || null;
      
      // ✅ ແກ້ໄຂ: ຈັດການກັບກໍລະນີພິເສດ
      let username;
      
      if (action === 'LOGIN' || action === 'LOGIN_FAILED') {
        // ສຳລັບ login, ໃຊ້ username ຈາກ request body
        username = req.body?.username || 'unknown';
      } else if (req.user?.username) {
        // ສຳລັບ action ອື່ນໆ, ໃຊ້ຈາກ auth middleware
        username = req.user.username;
      } else {
        // ກໍລະນີອື່ນໆ
        username = 'anonymous';
      }
      
      // ດຶງ IP Address
      const ipAddress = 
        req.ip || 
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.headers['x-real-ip'] ||
        req.connection?.remoteAddress || 
        req.socket?.remoteAddress ||
        '::1';
      
      // ດຶງ User Agent
      const userAgent = req.headers['user-agent'] || 'Unknown';
      
      // ດຶງ Computer Name
      let computerName = 'Unknown';
      
      if (req.headers['x-computer-name']) {
        computerName = req.headers['x-computer-name'];
      } else {
        const uaMatch = userAgent.match(/\(([^)]+)\)/);
        if (uaMatch && uaMatch[1]) {
          const parts = uaMatch[1].split(';');
          computerName = parts[0]?.trim() || 'Unknown';
        }
      }
      
      // ດຶງ resource ID
      const resourceId = req.params.id || req.params.userId || req.body.id || null;
      
      // ສ້າງ details object
      const details = {
        method: req.method,
        path: req.path,
        params: req.params,
        query: req.query,
        body: sanitizeBody(req.body),
        statusCode: res.statusCode,
        computerName: computerName,
        browser: getBrowserInfo(userAgent),
        os: getOSInfo(userAgent),
        timestamp: new Date().toISOString()
      };

      // Debug log
      console.log('📝 Audit Log:', {
        userId,
        username,
        action,
        resource,
        ipAddress,
        computerName,
        path: req.path
      });

      // ບັນທຶກລົງ database
      db.run(
        `INSERT INTO audit_logs (user_id, username, action, resource, resource_id, ip_address, user_agent, details)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          username,
          action,
          resource,
          resourceId,
          ipAddress,
          userAgent,
          JSON.stringify(details)
        ],
        (err) => {
          if (err) {
            console.error('❌ Audit log error:', err);
          } else {
            console.log(`✅ Audit logged: ${username} - ${action} - ${resource} from ${ipAddress} (${computerName})`);
          }
        }
      );

      originalSend.call(this, data);
    };

    next();
  };
};

// ຟັງຊັນລຶບຂໍ້ມູນລະອຽດອ່ອນ
function sanitizeBody(body) {
  if (!body) return {};
  
  const sanitized = { ...body };
  delete sanitized.password;
  delete sanitized.newPassword;
  delete sanitized.currentPassword;
  delete sanitized.confirmPassword;
  
  return sanitized;
}

// ຟັງຊັນດຶງຂໍ້ມູນ Browser
function getBrowserInfo(userAgent) {
  if (!userAgent) return 'Unknown';
  
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Edg')) return 'Edge';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
  
  return 'Unknown Browser';
}

// ຟັງຊັນດຶງຂໍ້ມູນ OS
function getOSInfo(userAgent) {
  if (!userAgent) return 'Unknown';
  
  if (userAgent.includes('Windows NT 10.0')) return 'Windows 10/11';
  if (userAgent.includes('Windows NT 6.3')) return 'Windows 8.1';
  if (userAgent.includes('Windows NT 6.2')) return 'Windows 8';
  if (userAgent.includes('Windows NT 6.1')) return 'Windows 7';
  if (userAgent.includes('Mac OS X')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS') || userAgent.includes('iPhone')) return 'iOS';
  
  return 'Unknown OS';
}

module.exports = {
  auditLog
};