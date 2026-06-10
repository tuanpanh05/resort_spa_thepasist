package fu.se.smms.config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Converter
@Component
public class AesEncryptor implements AttributeConverter<String, String> {

    private static String secretKey;

    // Use property injection with a fallback default key to prevent NullPointerException
    @Value("${app.encryption.secret-key:mySecretKeyForAesEncryptionModul}")
    public void setSecretKey(String key) {
        AesEncryptor.secretKey = key;
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return null;
        }
        String key = (secretKey != null) ? secretKey : "mySecretKeyForAesEncryptionModul";
        return EncryptionUtils.encrypt(attribute, key);
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) {
            return null;
        }
        String key = (secretKey != null) ? secretKey : "mySecretKeyForAesEncryptionModul";
        try {
            return EncryptionUtils.decrypt(dbData, key);
        } catch (Exception e) {
            // If decryption fails (e.g. if the data in db is already plain text or has some format issue), 
            // return it as is or return null depending on requirements. Let's log it or return the data as fallback.
            return dbData;
        }
    }
}
