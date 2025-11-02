package villanidev.ai.chatbot.chat;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemStoreService service;

    public ItemController(ItemStoreService service) {
        this.service = service;
    }

    // List all items
    @GetMapping
    public List<String> list() {
        return service.listItems();
    }

    // Add an item (send plain text in the request body)
    @PostMapping(consumes = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<Void> add(@RequestBody String body) {
        boolean added = service.addItem(body);
        if (!added) return ResponseEntity.badRequest().build();
        // Location header points to the new resource path
        String id = body == null ? "" : body.trim();
        return ResponseEntity.created(URI.create("/api/items/" + id)).build();
    }

    // Delete an item by path variable (URL-decoded automatically)
    @DeleteMapping("/{item}")
    public ResponseEntity<Void> delete(@PathVariable String item) {
        return service.removeItem(item)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}


