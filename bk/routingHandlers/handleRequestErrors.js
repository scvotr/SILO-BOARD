'use strict'

const { logger } = require("../utils/logger")

const handleRequestErrors = async (res, error) => {
  // 1. Проверяем, не отправлен ли уже ответ
  if (res.headersSent) {
    console.error('Headers already sent, cannot handle error:', error.message)
    return
  }

  // 2. Правильное логирование
  logger.error(`Server-error: ${error.message}`, { 
    stack: error.stack,
    url: res.req?.url,
    method: res.req?.method
  })
  
  console.error('Произошла ошибка:', error.message)
  if (error.stack) {
    console.error('Stack trace:', error.stack)
  }

  // 3. Определяем статус код
  let statusCode = 500
  let clientMessage = 'Internal Server Error'

  if (error.status && error.status >= 400 && error.status < 600) {
    statusCode = error.status
  }

  // 4. Безопасная установка заголовков и отправка
  try {
    res.statusCode = statusCode
    res.setHeader('Content-Type', 'application/json')
    
    const errorResponse = {
      error: {
        message: clientMessage,
        // В development можно добавить больше информации
        ...(process.env.NODE_ENV === 'development' && {
          details: error.message,
          type: error.name
        })
      }
    }
    
    res.end(JSON.stringify(errorResponse))
  } catch (sendError) {
    // Если даже отправка ошибки не удалась
    console.error('Failed to send error response:', sendError)
  }
}

module.exports = { handleRequestErrors }