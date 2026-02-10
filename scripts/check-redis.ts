import { Redis } from 'ioredis'
import dotenv from 'dotenv'

dotenv.config()

async function checkRedis() {
    console.log('Testing Redis connection...')

    if (!process.env.REDIS_URL) {
        console.error('❌ REDIS_URL is not defined in .env')
        process.exit(1)
    }

    const redis = new Redis(process.env.REDIS_URL)

    try {
        // Test Ping
        const startPing = Date.now()
        await redis.ping()
        console.log(`✅ Redis PING successful (${Date.now() - startPing}ms)`)

        // Test Set/Get
        const testKey = 'test:cache:verification'
        const testValue = { timestamp: Date.now(), message: 'Redis is working!' }

        await redis.set(testKey, JSON.stringify(testValue), 'EX', 60)
        console.log('✅ Cache SET successful')

        const cached = await redis.get(testKey)
        if (cached) {
            const parsed = JSON.parse(cached)
            if (parsed.timestamp === testValue.timestamp) {
                console.log('✅ Cache GET successful (matches original)')
            } else {
                console.error('❌ Cache GET mismatch')
            }
        } else {
            console.error('❌ Cache GET failed (value not found)')
        }

        // Clean up
        await redis.del(testKey)
        console.log('✅ Cache DELETE successful')

        console.log('\n🎉 Redis caching is correctly configured and operational!')

    } catch (error) {
        console.error('❌ Redis connection failed:', error)
    } finally {
        await redis.quit()
    }
}

checkRedis()
