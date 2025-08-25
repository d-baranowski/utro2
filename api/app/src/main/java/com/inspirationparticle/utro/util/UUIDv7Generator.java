package com.inspirationparticle.utro.util;

import java.nio.ByteBuffer;
import java.security.SecureRandom;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * UUID Version 7 Generator
 * Generates time-ordered UUIDs based on Unix timestamp with millisecond precision
 * Compatible with PostgreSQL 18's UUID v7 implementation
 */
public class UUIDv7Generator {
    
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final AtomicInteger SEQUENCE = new AtomicInteger(RANDOM.nextInt() & 0xFFF);
    private static long lastTimestamp = 0;
    
    /**
     * Generate a new UUID v7
     * Format: 48-bit timestamp (ms) | 4-bit version | 12-bit random | 2-bit variant | 62-bit random
     */
    public static UUID generateUUIDv7() {
        long timestamp = System.currentTimeMillis();
        
        // Handle clock sequence for same millisecond
        synchronized (UUIDv7Generator.class) {
            if (timestamp == lastTimestamp) {
                int seq = SEQUENCE.incrementAndGet() & 0xFFF;
                if (seq == 0) {
                    // Sequence overflow, wait for next millisecond
                    while (timestamp == lastTimestamp) {
                        timestamp = System.currentTimeMillis();
                    }
                }
            } else {
                SEQUENCE.set(RANDOM.nextInt() & 0xFFF);
            }
            lastTimestamp = timestamp;
        }
        
        // Create 16 byte buffer for UUID
        ByteBuffer buffer = ByteBuffer.allocate(16);
        
        // Timestamp (48 bits)
        buffer.putShort((short) (timestamp >>> 32));
        buffer.putInt((int) timestamp);
        
        // Version (4 bits) and sequence (12 bits)
        int versionAndSeq = (0x7 << 12) | (SEQUENCE.get() & 0xFFF);
        buffer.putShort((short) versionAndSeq);
        
        // Variant (2 bits) and random (62 bits)
        byte[] randomBytes = new byte[8];
        RANDOM.nextBytes(randomBytes);
        randomBytes[0] = (byte) ((randomBytes[0] & 0x3F) | 0x80); // Set variant bits
        buffer.put(randomBytes);
        
        buffer.rewind();
        long mostSigBits = buffer.getLong();
        long leastSigBits = buffer.getLong();
        
        return new UUID(mostSigBits, leastSigBits);
    }
    
    /**
     * Extract timestamp from UUID v7
     */
    public static long extractTimestamp(UUID uuid) {
        long mostSigBits = uuid.getMostSignificantBits();
        return (mostSigBits >>> 16) & 0xFFFFFFFFFFFFL;
    }
    
    /**
     * Check if a UUID is version 7
     */
    public static boolean isUUIDv7(UUID uuid) {
        long mostSigBits = uuid.getMostSignificantBits();
        int version = (int) ((mostSigBits >>> 12) & 0xF);
        return version == 7;
    }
}