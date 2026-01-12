package popeye.popeyebackend.pay.toss;

import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import popeye.popeyebackend.pay.toss.dto.cancel.TossCancelRequestDto;
import popeye.popeyebackend.pay.toss.dto.cancel.TossCancelResponseDto;
import popeye.popeyebackend.pay.toss.dto.confirm.TossConfirmRequestDto;
import popeye.popeyebackend.pay.toss.dto.confirm.TossConfirmResponseDto;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Component
@RequiredArgsConstructor
public class TossPaymentsClient {

    private final TossPaymentsProperties props;
    private final RestTemplate restTemplate;

    public TossConfirmResponseDto confirm(String paymentKey, String orderId, int amount) {
        String url = props.getBaseUrl() + "/v1/payments/confirm";
        HttpHeaders headers = defaultHeaders();
        TossConfirmRequestDto body = new TossConfirmRequestDto(paymentKey, orderId, amount);
        return restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(body, headers), TossConfirmResponseDto.class)
                .getBody();
    }

    public TossCancelResponseDto cancel(String paymentKey, String cancelReason) {
        String url = props.getBaseUrl() + "/v1/payments/" + paymentKey + "/cancel";
        HttpHeaders headers = defaultHeaders();
        TossCancelRequestDto body = new TossCancelRequestDto(cancelReason, null); // 전액 취소
        return restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(body, headers), TossCancelResponseDto.class)
                .getBody();
    }

    private HttpHeaders defaultHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", basicAuthHeader(props.getSecretKey())); // :contentReference[oaicite:6]{index=6}
        return headers;
    }

    private String basicAuthHeader(String secretKey) {
        // secretKey 뒤에 ":" 붙여 base64 인코딩 :contentReference[oaicite:4]{index=4}
        String raw = secretKey + ":";
        String encoded = Base64.getEncoder().encodeToString(raw.getBytes(StandardCharsets.UTF_8));
        return "Basic " + encoded;
    }
}
