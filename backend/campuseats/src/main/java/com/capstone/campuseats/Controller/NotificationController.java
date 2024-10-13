package com.capstone.campuseats.Controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {

    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    @GetMapping("/test")
    public String test() {
        return "Controller is working!";
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamNotifications() {
        SseEmitter emitter = new SseEmitter();
        emitters.add(emitter);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));

        return emitter;
    }

    public void sendNotification(String message) {
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(message);
            } catch (IOException e) {
                System.err.println("Error sending notification: " + e.getMessage());
                emitters.remove(emitter);
            }
        }
    }
}
