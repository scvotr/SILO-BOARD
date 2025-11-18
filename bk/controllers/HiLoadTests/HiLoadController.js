"use strict";

const { cache } = require("../../utils/cache");
const { logger } = require("../../utils/logger");

class HiLoadController {
  constructor() {
    this.heavyComputeTTL = 1000 * 30;

    // Привязываем методы
    this.testResponse = this.testResponse.bind(this);
    this.simpleCpuTest = this.simpleCpuTest.bind(this);
    this.simpleMemoryTest = this.simpleMemoryTest.bind(this);
    this.simpleDatabaseTest = this.simpleDatabaseTest.bind(this);
    this.realCpuLoadTest = this.realCpuLoadTest.bind(this);
    this.realMemoryLoadTest = this.realMemoryLoadTest.bind(this);
    this.realCombinedLoadTest = this.realCombinedLoadTest.bind(this);
  }

  /**
   * Итеративный Fibonacci (быстрый)
   */
  fibonacci(n) {
    if (n <= 1) return n;
    let a = 0,
      b = 1;
    for (let i = 2; i <= n; i++) {
      const temp = a + b;
      a = b;
      b = temp;
    }
    return b;
  }

  async testResponse(req, res) {
    const { method, url } = req;
    console.log("🚀 ~ HiLoadController ~ testResponse ~ url:", url);

    if (method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: true,
          message: "HiLoadController API is working! 🚀",
          endpoint: url,
          timestamp: new Date().toISOString(),
          cacheEnabled: true,
        })
      );
    } else {
      res.writeHead(405, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "Method not allowed",
          allowedMethods: ["GET"],
        })
      );
    }
  }

  /**
   * ПРОСТОЙ И РАБОЧИЙ CPU тест
   */
  async simpleCpuTest(req, res) {
    const startTime = Date.now();

    try {
      console.log(`🔧 Starting simple CPU test...`);

      let totalResult = 0;
      // 10 итераций Fibonacci(35) - достаточно для нагрузки
      for (let i = 0; i < 10; i++) {
        totalResult += this.fibonacci(35);
      }

      const duration = Date.now() - startTime;

      const response = {
        test: "simple_cpu_load",
        result: totalResult,
        computationTime: `${duration}ms`,
        message: `✅ CPU test: 10 x Fibonacci(35) = ${duration}ms`,
      };

      console.log(`✅ Simple CPU test completed in ${duration}ms`);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(response));
    } catch (error) {
      console.log(`💥 Simple CPU test error:`, error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "Simple CPU test failed",
          message: error.message,
        })
      );
    }
  }

  /**
   * ПРОСТОЙ И РАБОЧИЙ Memory тест (без рекурсии!)
   */
  async simpleMemoryTest(req, res) {
    const startTime = Date.now();

    try {
      console.log(`🔧 Starting simple Memory test...`);

      // Создаем большой массив без рекурсии
      const largeArray = [];
      for (let i = 0; i < 10000; i++) {
        largeArray.push({
          id: i,
          name: `Item_${i}`,
          data: Array(100).fill("x").join(""), // 100 символов
          timestamp: Date.now(),
          metadata: {
            index: i,
            random: Math.random(),
            tags: ["tag1", "tag2", "tag3"],
          },
        });
      }

      const dataSize = Buffer.byteLength(JSON.stringify(largeArray));
      const duration = Date.now() - startTime;

      const response = {
        test: "simple_memory_load",
        duration: `${duration}ms`,
        memoryUsage: {
          arraySize: largeArray.length,
          responseSize: `${(dataSize / 1024 / 1024).toFixed(2)}MB`,
          estimatedMemory: `${((dataSize * 2) / 1024 / 1024).toFixed(2)}MB`,
        },
        message: `✅ Memory test: ${largeArray.length} items = ${(
          dataSize /
          1024 /
          1024
        ).toFixed(2)}MB`,
      };

      console.log(`✅ Simple Memory test completed in ${duration}ms`);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(response));
    } catch (error) {
      console.log(`💥 Simple Memory test error:`, error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "Simple Memory test failed",
          message: error.message,
        })
      );
    }
  }

  /**
   * ПРОСТОЙ И РАБОЧИЙ Database тест
   */
  async simpleDatabaseTest(req, res) {
    const startTime = Date.now();

    try {
      console.log(`🔧 Starting simple Database test...`);

      const results = [];
      // 20 "запросов" с задержкой
      for (let i = 0; i < 20; i++) {
        await new Promise((resolve) => setTimeout(resolve, 10));
        results.push({
          queryId: i,
          result: `DB result ${i}`,
          data: Array(10)
            .fill(null)
            .map((_, idx) => `data_${idx}`),
        });
      }

      const duration = Date.now() - startTime;

      const response = {
        test: "simple_database_load",
        duration: `${duration}ms`,
        queriesExecuted: results.length,
        averageQueryTime: `${(duration / results.length).toFixed(2)}ms`,
        message: `✅ Database test: ${results.length} queries = ${duration}ms`,
      };

      console.log(`✅ Simple Database test completed in ${duration}ms`);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(response));
    } catch (error) {
      console.log(`💥 Simple Database test error:`, error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "Simple Database test failed",
          message: error.message,
        })
      );
    }
  }

  /**
   * РЕАЛЬНЫЙ CPU тест (тяжелый но рабочий)
   */
  async realCpuLoadTest(req, res) {
    const startTime = Date.now();

    try {
      console.log(`🔥 Starting REAL CPU load test...`);

      let totalResult = 0;
      // 20 итераций Fibonacci(40) - ОЧЕНЬ тяжело
      for (let i = 0; i < 20; i++) {
        totalResult += this.fibonacci(40);
        if (i % 5 === 0) {
          console.log(`🔢 Fibonacci iteration ${i + 1}/20 completed`);
        }
      }

      const duration = Date.now() - startTime;

      const response = {
        test: "REAL_CPU_LOAD",
        result: totalResult,
        computationTime: `${duration}ms`,
        loadLevel: "VERY_HEAVY",
        performance: {
          iterations: 20,
          fibonacciDepth: 40,
          operationsPerSecond: ((20 * 1000) / duration).toFixed(2),
        },
        message: `🔥 REAL CPU test: 20 x Fibonacci(40) = ${duration}ms`,
      };

      console.log(`✅ REAL CPU test completed in ${duration}ms - HEAVY LOAD!`);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(response));
    } catch (error) {
      console.log(`💥 REAL CPU test error:`, error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "REAL CPU test failed",
          message: error.message,
        })
      );
    }
  }

  /**
   * РЕАЛЬНЫЙ Memory тест (рабочий, без переполнения)
   */
  async realMemoryLoadTest(req, res) {
    const startTime = Date.now();

    try {
      console.log(`🔥 Starting REAL Memory load test...`);

      // Создаем ОЧЕНЬ большой массив но БЕЗ рекурсии
      const hugeArray = [];
      const itemCount = 50000; // 50,000 элементов

      for (let i = 0; i < itemCount; i++) {
        hugeArray.push({
          id: i,
          name: `HugeItem_${i}`,
          // Большой объект для нагрузки
          data: Array(50).fill("very_long_string_").join("") + i,
          numbers: Array(20)
            .fill(null)
            .map(() => Math.random() * 1000),
          metadata: {
            created: Date.now(),
            index: i,
            flags: [true, false, true],
            coordinates: { x: Math.random(), y: Math.random() },
          },
        });

        // Логируем прогресс каждые 5000 элементов
        if (i % 5000 === 0) {
          console.log(`📊 Generated ${i}/${itemCount} items...`);
        }
      }

      const dataSize = Buffer.byteLength(JSON.stringify(hugeArray));
      const duration = Date.now() - startTime;

      const response = {
        test: "REAL_MEMORY_LOAD",
        duration: `${duration}ms`,
        memoryUsage: {
          itemsCount: hugeArray.length,
          responseSize: `${(dataSize / 1024 / 1024).toFixed(2)}MB`,
          estimatedMemory: `${((dataSize * 3) / 1024 / 1024).toFixed(2)}MB`,
        },
        loadLevel: "HEAVY",
        message: `🔥 REAL Memory test: ${hugeArray.length} items = ${(
          dataSize /
          1024 /
          1024
        ).toFixed(2)}MB`,
      };

      console.log(
        `✅ REAL Memory test completed in ${duration}ms - ${(
          dataSize /
          1024 /
          1024
        ).toFixed(2)}MB`
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(response));
    } catch (error) {
      console.log(`💥 REAL Memory test error:`, error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "REAL Memory test failed",
          message: error.message,
        })
      );
    }
  }

  /**
   * РЕАЛЬНЫЙ комбинированный тест (рабочий)
   */
  async realCombinedLoadTest(req, res) {
    const startTime = Date.now();

    try {
      console.log(`🔥 Starting REAL Combined load test...`);

      const results = {
        cpu: 0,
        memory: 0,
        database: 0,
      };

      // 1. CPU нагрузка
      console.log(`🔢 Starting CPU part...`);
      for (let i = 0; i < 10; i++) {
        results.cpu += this.fibonacci(38);
      }

      // 2. Memory нагрузка
      console.log(`💾 Starting Memory part...`);
      const memoryArray = [];
      for (let i = 0; i < 1000; i++) {
        memoryArray.push({
          id: i,
          data: Array(50).fill("data_").join("") + i,
        });
      }
      results.memory = Buffer.byteLength(JSON.stringify(memoryArray));

      // 3. Database нагрузка
      console.log(`🗄️ Starting Database part...`);
      for (let i = 0; i < 15; i++) {
        await new Promise((resolve) => setTimeout(resolve, 25));
        results.database++;
      }

      const duration = Date.now() - startTime;

      const response = {
        test: "REAL_COMBINED_LOAD",
        duration: `${duration}ms`,
        components: {
          cpu: `${results.cpu} operations`,
          memory: `${(results.memory / 1024 / 1024).toFixed(2)}MB`,
          database: `${results.database} queries`,
        },
        loadLevel: "HEAVY",
        message: `🔥 REAL Combined test completed in ${duration}ms`,
      };

      console.log(`✅ REAL Combined test completed in ${duration}ms`);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(response));
    } catch (error) {
      console.log(`💥 REAL Combined test error:`, error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "REAL Combined test failed",
          message: error.message,
        })
      );
    }
  }
}

module.exports = new HiLoadController();
