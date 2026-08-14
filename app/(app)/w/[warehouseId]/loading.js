import { Box, Stack, Skeleton } from "@mui/material";

export default function Loading() {
  return (
    <Box>
      <Skeleton variant="text" width={180} height={40} sx={{ mb: 2 }} />
      <Stack spacing={1.5}>
        <Skeleton variant="rounded" height={72} />
        <Skeleton variant="rounded" height={72} />
        <Skeleton variant="rounded" height={72} />
      </Stack>
    </Box>
  );
}
