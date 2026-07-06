package com.qitoffer.common;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PasswordsTest {
    @Test
    void hashMatchesSeedAlgorithm() {
        String hash = Passwords.hash("admin123");
        assertTrue(Passwords.matches("admin123", hash));
        assertFalse(Passwords.matches("wrong", hash));
    }
}

