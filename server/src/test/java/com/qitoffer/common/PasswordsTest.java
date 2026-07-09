package com.qitoffer.common;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PasswordsTest {
    @Test
    void hashMatchesSeedAlgorithm() {
        String hash = Passwords.hash("123456");
        assertTrue(Passwords.matches("123456", hash));
        assertFalse(Passwords.matches("wrong", hash));
    }
}
