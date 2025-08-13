package com.inspirationparticle.utro.time;

import com.google.protobuf.Timestamp;

import java.time.Instant;

public class TimeMapper {
    public static Timestamp timestampFromInstant(Instant instant) {
        if (instant == null) return null;

        return Timestamp.newBuilder()
                .setSeconds(instant.getEpochSecond())
                .setNanos(instant.getNano())
                .build();
    }
}
