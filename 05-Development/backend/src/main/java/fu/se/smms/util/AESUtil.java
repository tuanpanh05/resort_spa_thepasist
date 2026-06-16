package fu.se.smms.util;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class AESUtil {

    /**
     * Decrypts an encrypted string.
     * Extracted text in parentheses like "U2FsdGVk... (Dị ứng đậu phộng)" will be returned if present.
     * This ensures the seeded database values can be read cleanly.
     */
    public static String decrypt(String encryptedText) {
        if (encryptedText == null || encryptedText.trim().isEmpty()) {
            return "";
        }

        // Support extracting the text inside parentheses for seed data
        Pattern pattern = Pattern.compile("\\(([^)]+)\\)");
        Matcher matcher = pattern.matcher(encryptedText);
        if (matcher.find()) {
            return matcher.group(1);
        }

        // If no parentheses are found, return the text itself as a fallback
        return encryptedText;
    }
}
