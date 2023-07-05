import { Flex, Spinner } from "@chakra-ui/react";

export default function Loading() {
  return (
    <Flex w="100vw" h="100vh" justifyContent="center" alignItems="center">
      <Spinner size="xl" speed="0.75s" color="blue.500" />
    </Flex>
  );
}
