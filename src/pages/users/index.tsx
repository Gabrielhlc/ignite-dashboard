import { useState } from 'react';
import { GetServerSideProps } from "next";
import NextLink from "next/link";
import {
    Box,
    Button,
    Checkbox,
    Flex,
    Heading,
    Icon,
    Link,
    Spinner,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useBreakpointValue
} from "@chakra-ui/react";
import { RiAddLine, RiPencilLine } from "react-icons/ri";

import { api } from "../../services/api";
import { getUsers, useUsers } from "../../services/hooks/useUsers";
import { queryClient } from "../../services/queryClient";

import { Header } from "../../components/Header";
import { Sidebar } from "../../components/Sidebar";
import { Pagination } from "../../components/Pagination";

/*
    ~~~~~ IMPORTANT NOTE ~~~~~
    Miragejs doesn't support to server-side, only client-side.
    Due to this, the requests shall return error 404.
    This code is built to a concrete API.
    If you wish to use it with Miragejs, do this:
    - Remove the getServerSideProps;
    - Remove users from the UserList's parameter;
    - Remove the second argument of useUsers, in which defines initialData.
*/

export default function UserList({ users }) {
    const [page, setPage] = useState(1);
    const { data, isLoading, isFetching, error } = useUsers(page, {
        initialData: users,
    });

    const isWideVersion = useBreakpointValue({
        base: false,
        lg: true
    });

    async function handleprefetchUser(userId: string) {
        await queryClient.prefetchQuery(['user', userId], async () => {
            const response = await api.get(`users/${userId}`)

            return response.data;
        }, {
            staleTime: 1000 * 60 * 10, // 10 min
        })
    }

    return (
        <Box>
            <Header />

            <Flex w="100%" my="6" maxW={1480} mx="auto" px="6">
                <Sidebar />

                <Box flex="1" borderRadius={8} bg="gray.800" p={["6", "8"]}>
                    <Flex mb="8" justify="space-between" align="center">
                        <Heading size="lg" fontWeight="normal">
                            Usuários

                            {!isLoading && isFetching && <Spinner size="sm" color="gray.500" ml="4" />}
                        </Heading>
                        <NextLink href="/users/create" passHref>
                            <Button

                                size="sm"
                                fontSize="sm"
                                colorScheme="pink"
                                cursor="pointer"
                                leftIcon={<Icon as={RiAddLine} fontSize="20" />}
                            >
                                Criar novo
                            </Button>
                        </NextLink>
                    </Flex>

                    {isLoading ? (
                        <Flex justify="center">
                            <Spinner />
                        </Flex>
                    ) : error ? (
                        <Flex justify="center">
                            <Text>Falha ao obter os dados dos usuários.</Text>
                        </Flex>
                    ) : (
                        <>
                            <Table colorScheme="whiteAlpha">
                                <Thead>
                                    <Tr>
                                        <Th px={["4", "4", "6"]} color="gray.300" w="8">
                                            <Checkbox colorScheme="pink" />
                                        </Th>
                                        <Th>Usuário</Th>
                                        {isWideVersion && <Th>Data de cadastro</Th>}

                                        <Th w="8"></Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {data!.users.map(user => {
                                        return (
                                            <Tr key={user.id}>
                                                <Td px={["4", "4", "6"]}>
                                                    <Checkbox colorScheme="pink" />
                                                </Td>
                                                <Td>
                                                    <Box>
                                                        <Link color="purple.400" onMouseEnter={() => handleprefetchUser(user.id)}>
                                                            <Text fontWeight="bold">{user.name}</Text>
                                                        </Link>
                                                        <Text fontSize="sm" color="gray.300">{user.email}</Text>
                                                    </Box>
                                                </Td>
                                                {isWideVersion && <Td>{user.createdAt}</Td>}
                                                <Td>
                                                    <Button
                                                        size="sm"
                                                        fontSize="sm"
                                                        colorScheme="purple"
                                                        cursor="pointer"
                                                        iconSpacing={isWideVersion ? '1.5' : '-0.5'}
                                                        leftIcon={<Icon as={RiPencilLine} fontSize="16" />}
                                                    >
                                                        {isWideVersion ? 'Editar' : ''}
                                                    </Button>
                                                </Td>
                                            </Tr>
                                        )
                                    })}
                                </Tbody>
                            </Table>

                            <Pagination
                                totalCountOfRegisters={data!.totalCount}
                                currentPage={page}
                                onPageChange={setPage}
                            />
                        </>
                    )}
                </Box>
            </Flex>
        </Box>
    )
}

export const getServerSideProps: GetServerSideProps = async () => {
    const { users } = await getUsers(1);

    return {
        props: {
            users,
        }
    }
}