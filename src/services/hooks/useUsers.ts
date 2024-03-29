import { useQuery, UseQueryOptions } from "react-query";
import { api } from "../api";

type User = {
    id: string;
    name: string;
    email: string;
    createdAt: string;
}

interface Data {
    users: User[];
}

type GetUsersResponse = {
    totalCount: number,
    users: User[]
}

export async function getUsers(page: number): Promise<GetUsersResponse> {
    const { data, headers } = await api.get<Data>('users', {
        params: {
            page,
        }
    });

    const totalCount = Number(headers['x-total-count'])

    const users = data.users.map(user => {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: new Date(user.createdAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            })
        }
    })

    return {
        users,
        totalCount,
    };
}
// doidera esse options, veio de uma resposta do mantenedor numa issue do github
export function useUsers(page: number, options?: UseQueryOptions<GetUsersResponse, unknown, GetUsersResponse, ["users", number]>) {
    return useQuery(['users', page], () => getUsers(page), {
        staleTime: 1000 * 5, // 5 seconds
        ...options
    })
}