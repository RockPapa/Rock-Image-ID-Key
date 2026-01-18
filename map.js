// ===== MAPKIT TOKEN =====
// PASTE YOUR *FULL* TOKEN BETWEEN THE QUOTES
const MAPKIT_TOKEN ="eyJhbGciOiJFUzI1NiIsImtpZCI6Ijk5OVQ1OUczR1AiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJKQlRTNkdaVUc2IiwiaWF0IjoxNzY4NzYyODY1LCJleHAiOjE3NzEzNTQ4NjV9.3NEfyxJnZR3OyTP35cKHm6bc7vLZKRv_un9IryLqNIloni0RIPFo005bqBmBSmeB0OfB9zpXklDTmbOnokACKg";


// ===== INIT MAPKIT =====
mapkit.init({
  authorizationCallback: function (done) {
    done(MAPKIT_TOKEN);
  }
});

// ===== CENTER: STATE BOTANICAL GARDEN OF GEORGIA =====
const sbg = new mapkit.Coordinate(35.772, -78.673);

// ===== CREATE MAP =====
const map = new mapkit.Map("map", {
  center: sbg,
  zoomLevel: 16,
  showsCompass: true
});

// ===== ADD MARKER =====
const marker = new mapkit.MarkerAnnotation(sbg);
map.addAnnotation(marker);
