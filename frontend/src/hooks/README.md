# This Folder is supposed to contain all the hooks
```
.
└── src/
    └── hooks/
        └──useBear.ts
```

Each hook should be in its own file named after the hook. The file should contain the hook implementation (e.g., `useBear.ts`).


The use of a hook is demonstrated below:

```typescript
function BearCounter() {
  const bears = useBear((state) => state.bears)
  return <h1>{bears} bears around here...</h1>
}

function Controls() {
  const increasePopulation = useBear((state) => state.increasePopulation)
  return <button onClick={increasePopulation}>one up</button>
}
```