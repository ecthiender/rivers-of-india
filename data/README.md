* to use the overpass-cli 

```
cat river_query.ql | ./node_modules/query-overpass/cli.js > rivers_20200306.geojson
```

The above function OOMs and core dumps.

```
❯ cat river_query.ql | ./node_modules/query-overpass/cli.js > rivers_20220209.geojson 

<--- Last few GCs --->

[298605:0x563ecaa4ab10]   446265 ms: Mark-sweep 4062.5 (4138.0) -> 4052.7 (4143.5) MB, 2374.0 / 0.0 ms  (average mu = 0.445, current mu = 0.014) allocation failure scavenge might not succeed
[298605:0x563ecaa4ab10]   449943 ms: Mark-sweep 4068.8 (4143.7) -> 4058.6 (4149.5) MB, 3601.0 / 0.0 ms  (average mu = 0.235, current mu = 0.021) allocation failure scavenge might not succeed


<--- JS stacktrace --->

FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
 1: 0x563ec87726b1 node::Abort() [node]
 2: 0x563ec8678ceb node::FatalError(char const*, char const*) [node]
 3: 0x563ec8952782 v8::Utils::ReportOOMFailure(v8::internal::Isolate*, char const*, bool) [node]
 4: 0x563ec89529e8 v8::internal::V8::FatalProcessOutOfMemory(v8::internal::Isolate*, char const*, bool) [node]
 5: 0x563ec8af82c6  [node]
 6: 0x563ec8b09bf2 v8::internal::Heap::CollectGarbage(v8::internal::AllocationSpace, v8::internal::GarbageCollectionReason, v8::GCCallbackFlags) [node]
 7: 0x563ec8b0beca v8::internal::Heap::AllocateRawWithLightRetrySlowPath(int, v8::internal::AllocationType, v8::internal::AllocationOrigin, v8::internal::AllocationAlignment) [node]
 8: 0x563ec8b0bf57 v8::internal::Heap::AllocateRawWithRetryOrFailSlowPath(int, v8::internal::AllocationType, v8::internal::AllocationOrigin, v8::internal::AllocationAlignment) [node]
 9: 0x563ec8acfa5d v8::internal::Factory::NewFillerObject(int, bool, v8::internal::AllocationType, v8::internal::AllocationOrigin) [node]
10: 0x563ec8e20429 v8::internal::Runtime_AllocateInYoungGeneration(int, unsigned long*, v8::internal::Isolate*) [node]
11: 0x563ec91d3bf9  [node]
[1]    298604 done                 cat river_query.ql | 
       298605 abort (core dumped)  ./node_modules/query-overpass/cli.js > rivers_20220209.geojson
```

The overpass CLI doesn't work. Just use the overpass website (http://overpass-turbo.eu/) and run the query and download the data in GeoJSON format.
