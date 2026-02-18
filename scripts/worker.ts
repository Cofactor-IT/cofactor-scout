/**
 * Worker Process Entry Point
 * 
 * To run the worker:
 * 1. Development: npx ts-node scripts/worker.ts
 * 2. Production: node dist/scripts/worker.js
 * 3. Or add to package.json: "worker": "ts-node scripts/worker.ts"
 * 
 * Environment variables needed:
 * - REDIS_URL (required)
 * - DATABASE_URL (required)
 * - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (optional, for emails)
 * - NEXTAUTH_URL or APP_URL (optional, for email links)
 */

import { Worker, Job } from 'bullmq'
import { getQueueConnection, closeQueueConnection } from '../lib/queues/connection'
import { EmailJobData, EmailJobType } from '../lib/queues/email.queue'
import { info, error, debug } from '../lib/logger'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
})

function getAppUrl() {
    return process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3000'
}

// Email processing functions
async function sendWelcomeEmail(toEmail: string, name: string): Promise<void> {
    const mailOptions = {
        from: process.env.SMTP_FROM || '"Cofactor Club" <no-reply@cofactor.world>',
        to: toEmail,
        subject: 'Welcome to Cofactor Club',
        text: `Hi ${name},\n\nWelcome to Cofactor Club! We're excited to have you join our student ambassador network.\n\nContribute to the Wiki!\n\nBest,\nThe Cofactor Team`,
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #6366f1;">Welcome to Cofactor Club!</h1>
                <p>Hi ${name},</p>
                <p>We're excited to have you join our student ambassador network.</p>
                <p><strong>Next Steps:</strong></p>
                <ul>

                    <li>Contribute to your university's wiki page.</li>

                </ul>
                <p>Best,<br>The Cofactor Team</p>
            </div>
        `
    }

    await transporter.sendMail(mailOptions)
}

async function sendVerificationEmail(toEmail: string, name: string, token: string): Promise<void> {
    const verifyUrl = `${getAppUrl()}/auth/verify?token=${token}`

    const mailOptions = {
        from: process.env.SMTP_FROM || '"Cofactor Club" <no-reply@cofactor.world>',
        to: toEmail,
        subject: 'Verify your email address',
        text: `Hi ${name},\n\nPlease verify your email address by clicking the link below:\n\n${verifyUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, please ignore this email.\n\nBest,\nThe Cofactor Team`,
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #6366f1;">Verify your email address</h1>
                <p>Hi ${name},</p>
                <p>Please click the button below to verify your email address:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verifyUrl}" style="background-color: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #6366f1;">${verifyUrl}</p>
                <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
                <p style="color: #666; font-size: 14px;">If you didn't create an account, please ignore this email.</p>
                <p>Best,<br>The Cofactor Team</p>
            </div>
        `
    }

    await transporter.sendMail(mailOptions)
}

async function sendPasswordResetEmail(toEmail: string, resetCode: string): Promise<void> {
    const resetUrl = `${getAppUrl()}/auth/reset-password`

    const mailOptions = {
        from: process.env.SMTP_FROM || '"Cofactor Club" <no-reply@cofactor.world>',
        to: toEmail,
        subject: 'Reset your password',
        text: `Hi,\n\nYou requested to reset your password. Use the code below to set a new password:\n\nReset Code: ${resetCode}\n\nGo to: ${resetUrl}\n\nThis code will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest,\nThe Cofactor Team`,
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #6366f1;">Reset your password</h1>
                <p>You requested to reset your password. Use the code below to set a new password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; display: inline-block;">
                        <span style="font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #6366f1;">${resetCode}</span>
                    </div>
                </div>
                <p>Go to <a href="${resetUrl}" style="color: #6366f1;">this page</a> and enter the code.</p>
                <p style="color: #666; font-size: 14px;">This code will expire in 1 hour.</p>
                <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
                <p>Best,<br>The Cofactor Team</p>
            </div>
        `
    }

    await transporter.sendMail(mailOptions)
}

async function sendNotificationEmail(
    toEmail: string,
    name: string,
    title: string,
    message: string,
    link?: string
): Promise<void> {
    const mailOptions = {
        from: process.env.SMTP_FROM || '"Cofactor Club" <no-reply@cofactor.world>',
        to: toEmail,
        subject: title,
        text: `Hi ${name},\n\n${message}\n\n${link ? `View details: ${getAppUrl()}${link}` : ''}\n\nBest,\nThe Cofactor Team`,
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #6366f1;">${title}</h1>
                <p>Hi ${name},</p>
                <p>${message}</p>
                ${link ? `
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${getAppUrl()}${link}" style="background-color: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">View Details</a>
                </div>
                ` : ''}
                <p>Best,<br>The Cofactor Team</p>
            </div>
        `
    }

    await transporter.sendMail(mailOptions)
}

// Email Worker processor
async function processEmailJob(job: Job<EmailJobData>): Promise<void> {
    const { type, toEmail, name, metadata } = job.data

    if (!process.env.SMTP_USER) {
        info('SMTP not configured, skipping email', { type, toEmail })
        return
    }

    debug('Processing email job', { jobId: job.id, type, toEmail })

    switch (type) {
        case EmailJobType.WELCOME:
            await sendWelcomeEmail(toEmail, name)
            break
        case EmailJobType.VERIFICATION:
            if (!metadata?.token) throw new Error('Verification token is required')
            await sendVerificationEmail(toEmail, name, metadata.token)
            break
        case EmailJobType.PASSWORD_RESET:
            if (!metadata?.resetCode) throw new Error('Reset code is required')
            await sendPasswordResetEmail(toEmail, metadata.resetCode)
            break
        case EmailJobType.NOTIFICATION:
            if (!metadata?.title || !metadata?.message) throw new Error('Title and message are required')
            await sendNotificationEmail(toEmail, name, metadata.title, metadata.message, metadata?.link)
            break
        default:
            throw new Error(`Unknown email type: ${type}`)
    }

    info('Email sent successfully', { jobId: job.id, type, toEmail })
}

// Create workers
async function startWorkers() {
    const redis = getQueueConnection()
    if (!redis) {
        throw new Error('Redis connection not available. Please set REDIS_URL environment variable.')
    }

    info('Starting job workers...')

    // Email Worker
    const emailWorker = new Worker<EmailJobData>('email', processEmailJob, {
        connection: redis,
        concurrency: 5,
    })

    emailWorker.on('completed', (job) => {
        info('Email job completed', { jobId: job.id, type: job.data.type })
    })

    emailWorker.on('failed', (job, err) => {
        error('Email job failed permanently', {
            jobId: job?.id,
            type: job?.data.type,
            error: err.message
        })
    })
    info('Workers started successfully', { emailWorker: emailWorker.id })

    // Graceful shutdown
    process.on('SIGTERM', async () => {
        info('SIGTERM received, closing workers...')
        await emailWorker.close()
        await closeQueueConnection()
        process.exit(0)
    })

    process.on('SIGINT', async () => {
        info('SIGINT received, closing workers...')
        await emailWorker.close()
        await closeQueueConnection()
        process.exit(0)
    })
}

// Start workers if running directly
if (require.main === module) {
    startWorkers().catch((err) => {
        error('Failed to start workers', { error: err.message })
        process.exit(1)
    })
}

export { startWorkers }
