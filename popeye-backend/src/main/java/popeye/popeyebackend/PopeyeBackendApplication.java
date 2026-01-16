package popeye.popeyebackend;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
@Slf4j
public class PopeyeBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(PopeyeBackendApplication.class, args);
    }

}
