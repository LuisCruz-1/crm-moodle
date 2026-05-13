<?php

namespace App\Http\Controllers\Crm;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentSearchController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));
        if ($q === '') {
            return response()->json(['data' => []]);
        }

        $students = Student::query()
            ->where(function ($query) use ($q) {
                $query
                    ->where('email', 'like', "%{$q}%")
                    ->orWhere('identity_doc', 'like', "%{$q}%")
                    ->orWhere('first_name', 'like', "%{$q}%")
                    ->orWhere('last_name', 'like', "%{$q}%");
            })
            ->orderBy('id', 'desc')
            ->limit(10)
            ->get(['id', 'first_name', 'last_name', 'email', 'identity_doc', 'phone']);

        return response()->json(['data' => $students]);
    }
}
