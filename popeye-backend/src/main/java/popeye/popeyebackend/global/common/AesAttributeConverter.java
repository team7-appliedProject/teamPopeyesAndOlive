package popeye.popeyebackend.global.common;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.RequiredArgsConstructor;
import popeye.popeyebackend.global.util.EncryptionUtil;


//U-08: 엔티티 필드 자동 암/복호화 컨버터 (Entitty <> DB)
@Converter
@RequiredArgsConstructor
public class AesAttributeConverter implements AttributeConverter<String, String> {

    private final EncryptionUtil encryptionUtil;
    //암호화
    @Override
    public String convertToDatabaseColumn(String attribute) {
        return encryptionUtil.encrypt(attribute);
    }
    //복호화
    @Override
    public String convertToEntityAttribute(String dbData) {
        return encryptionUtil.decrypt(dbData);
    }
}